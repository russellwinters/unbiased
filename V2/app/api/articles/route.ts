import { NextRequest, NextResponse } from 'next/server';
import { getRssData, ParsedArticle, isValidBiasRating } from '@/lib/news';
import { 
  prisma, 
  upsertArticles, 
  upsertSources,
  checkUpdateLimit,
  createUpdateHistory,
  completeUpdateHistory,
  failUpdateHistory,
} from '@/lib/db';
import { filterWithinRange, yesterdayAtMidnight } from "@/lib/utils"
import type { Article, Source } from '@prisma/client';

/**
 * Response type for POST /api/articles
 */
interface ArticleUpdateResponse {
  success: boolean;
  sourcesCreated: number;
  sourcesUpdated: number;
  articlesCreated: number;
  articlesUpdated: number;
  articlesSkipped: number;
  errors: string[];
  timestamp: string;
}

/**
 * GET /api/articles
 * 
 * Fetches articles from the database with pagination support.
 * 
 * Query Parameters:
 * - source: (optional) Filter by source name (e.g., 'The Guardian', 'Fox News')
 * - limit: (optional) Maximum number of articles to return per page (default: 50, max: 100)
 * - page: (optional) Page number (1-indexed, default: 1)
 * 
 * Response:
 * {
 *   articles: ParsedArticle[],
 *   count: number,
 *   totalCount: number,
 *   page: number,
 *   totalPages: number,
 *   sources: string[],
 *   usedMockData: boolean,
 *   errors: string[],
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    return await coreGetLogic(request);
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return respondWith500Error({ err: error, message: 'Failed to fetch articles' });
  }
}



/**
 * POST /api/articles
 * 
 * Fetches articles from RSS feeds and populates the database.
 * Articles are fetched from the beginning of the previous day to the current time.
 * De-duplication is handled through the unique `url` field on articles.
 * 
 * Rate limited to 3 updates per 24-hour period.
 * 
 * Response:
 * {
 *   success: boolean,
 *   sourcesCreated: number,
 *   sourcesUpdated: number,
 *   articlesCreated: number,
 *   articlesUpdated: number,
 *   articlesSkipped: number,
 *   errors: string[],
 *   timestamp: string
 * }
 */
export async function POST() {
  try {
    console.log('🚀 Checking rate limit for article update...');
    
    // Check rate limit FIRST
    const rateLimitCheck = await checkUpdateLimit();
    
    if (!rateLimitCheck.isAllowed) {
      console.log(`⚠️ Rate limit exceeded: ${rateLimitCheck.updatesInPreviousPeriod}/${rateLimitCheck.updateLimit} updates in 24h`);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `RSS feed updates are limited to ${rateLimitCheck.updateLimit} per 24-hour period. ${rateLimitCheck.updatesInPreviousPeriod} updates have already been performed.`,
          updatesToday: rateLimitCheck.updatesInPreviousPeriod,
          limit: rateLimitCheck.updateLimit,
          nextAllowedTime: rateLimitCheck.allowUpdateNext?.toISOString(),
          timestamp: new Date().toISOString(),
        },
        { status: 429 } // Too Many Requests
      );
    }
    
    console.log('✅ Rate limit check passed, starting update...');
    
    // Create history record
    const historyRecord = await createUpdateHistory({
      updateType: 'manual', // Could be detected from headers/auth in future
    });
    
    const startTime = new Date();
    
    try {
      // Existing RSS fetch logic
      const { sources, articles, rssErrors } = await getRssData();
      const recentArticles = filterWithinRange(articles, yesterdayAtMidnight());
      
      const { sourceMap, sourcesCreated, sourcesUpdated } = await upsertSources(sources);
      const { articlesCreated, articlesUpdated, articlesSkipped } = await upsertArticles(recentArticles, sourceMap);
      
      // Update history record with success
      await completeUpdateHistory(
        historyRecord.id,
        {
          sourcesCreated,
          sourcesUpdated,
          articlesCreated,
          articlesUpdated,
          articlesSkipped,
          errorMessages: rssErrors.map(e => `${e.sourceName}: ${e.error}`),
        },
        startTime
      );
      
      const response: ArticleUpdateResponse = {
        success: true,
        sourcesCreated,
        sourcesUpdated,
        articlesCreated,
        articlesUpdated,
        articlesSkipped,
        errors: rssErrors.map(e => `${e.sourceName}: ${e.error}`),
        timestamp: new Date().toISOString(),
      };
      
      console.log('🎉 Article update completed!');
      return NextResponse.json(response, { status: 200 });
      
    } catch (updateError) {
      // Update history record with failure
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      await failUpdateHistory(historyRecord.id, errorMessage, startTime);
      throw updateError; // Re-throw to be caught by outer catch
    }
    
  } catch (error) {
    console.error('❌ Error in POST /api/articles:', error);
    return respondWith500Error({ err: error, message: 'Failed to update articles' });
  }
}

function respondWith500Error({ err, message }: { err?: any, message?: string }) {
  return NextResponse.json(
    {
      error: message || 'Failed to fetch articles',
      message: err instanceof Error ? err.message : 'Unknown error'
    },
    { status: 500 }
  );
};

// TODO: update this so it's more like the post request
// with the calls pulled from utils elsewhere in the codebase
async function coreGetLogic(request: NextRequest) {
  const { sourceFilter, limit, page } = parseQueryParams(request.nextUrl.searchParams);

  try {
    const whereClause = sourceFilter
      ? {
        source: {
          name: {
            equals: sourceFilter,
            mode: 'insensitive' as const,
          },
        },
      }
      : {};

    const count = await prisma.article.count({
      where: whereClause,
    });

    const { pagesTotal, skipCount } = getPaginationData(count, limit, page);

    const dbArticles = await prisma.article.findMany({
      where: whereClause,
      include: {
        source: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: skipCount,
      take: limit,
    });

    const articles: ParsedArticle[] = dbArticles.map((article: Article & { source: Source }) => {
      const biasRating = isValidBiasRating(article.source.biasRating)
        ? article.source.biasRating
        : 'center';

      return {
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          biasRating,
        },
      };
    });

    const sources = [...new Set(articles.map((a) => a.source.name))];

    return NextResponse.json({
      articles,
      count: articles.length,
      totalCount: count,
      page,
      totalPages: pagesTotal,
      sources,
      usedMockData: false,
      errors: [],
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    console.error('Database query failed:', dbError);
    return respondWith500Error({ err: dbError, message: 'Database query failed' });
  }
}

function getPaginationData(count: number, pageLimit: number, pageCurrent: number) {
  const pagesTotal = Math.ceil(count / pageLimit);
  const skipCount = (pageCurrent - 1) * pageLimit;
  return { pagesTotal, skipCount };
}

function parseQueryParams(params: URLSearchParams) {
  const sourceFilter = params.get('source');
  const limitParam = params.get('limit');
  const pageParam = params.get('page');

  let limit = parseIntParam(limitParam, 50);
  let page = parseIntParam(pageParam, 1);

  return { sourceFilter, limit, page };
}

function parseIntParam(param: string | null, defaultValue: number, minValue: number = 0) {
  if (param === null) return defaultValue;

  const parsed = parseInt(param, 10);
  if (!isNaN(parsed) && parsed > minValue) {
    return parsed;
  }

  return defaultValue;
}