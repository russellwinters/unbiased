import { NextRequest, NextResponse } from 'next/server';
import { getRssData, ParsedArticle, isValidBiasRating, BiasRating } from '@/lib/news';
import {
  prisma,
  upsertArticles,
  upsertSources,
  checkUpdateLimit,
  createUpdateHistory,
  completeUpdateHistory,
  failUpdateHistory,
} from '@/lib/db';
import { filterWithinRange, isValidUUID, parseIntParam, parseStringListParam, yesterdayAtMidnight } from "@/lib/utils"
import type { Article, Source, Prisma } from '@prisma/client';

const CRON_KEY = process.env.CRON_SECRET;

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
 * - source: (optional) Filter by source name (e.g., 'The Guardian', 'Fox News') - DEPRECATED, use sourceIds instead
 * - sourceIds: (optional) Comma-separated list of source UUIDs for filtering
 * - bias: (optional) Comma-separated list of bias ratings for filtering
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
export async function POST(request: NextRequest) {
  const cronErrorResponse = getCronErrorResponse(request);
  if (cronErrorResponse) {
    return cronErrorResponse;
  }


  console.log('🚀 Checking rate limit for article update...');
  const rateLimitResponse = await getRateLimitResponse();
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  console.log('✅ Rate limit check passed, starting update...');

  // TODO: function to create this update history -- silent failure should not prevent update from proceeding, but any errors should be logged and reflected in the final update history record
  const historyRecord = await createUpdateHistory({
    updateType: CRON_KEY ? 'scheduled' : 'manual',
  });
  const [status, historyRecordResult] = await initHistoryRecord();
  if (status === "error") {
    return historyRecordResult as NextResponse;
  }

  const startTime = new Date();

  try {
    const { sources, articles, rssErrors } = await getRssData();
    const recentArticles = filterWithinRange(articles, yesterdayAtMidnight());

    const { sourceMap, sourcesCreated, sourcesUpdated } = await upsertSources(sources);
    const { articlesCreated, articlesUpdated, articlesSkipped } = await upsertArticles(recentArticles, sourceMap);

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
    const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
    await failUpdateHistory(historyRecord.id, errorMessage, startTime);
    return updateError instanceof Error
      ? respondWith500Error({ err: updateError, message: 'Failed to update articles' })
      : respondWith500Error({ message: 'Failed to update articles' });
  }
}

// -------------------------------- //
// -------- GEENERAL UTILS ------- // 
// -------------------------------- // 
function respondWith500Error({ err, message }: { err?: unknown, message?: string }) {
  return NextResponse.json(
    {
      error: message || 'Failed to fetch articles',
      message: err instanceof Error ? err.message : 'Unknown error'
    },
    { status: 500 }
  );
};

// -------------------------------- //
// ------ GET LOGIC AND UTILS ----- // 
// -------------------------------- // 

// TODO: update this so it's more like the post request
// with the calls pulled from utils elsewhere in the codebase
async function coreGetLogic(request: NextRequest) {
  const { sourceFilter, sourceIdsFilter, biasFilter, limit, page } = parseQueryParams(request.nextUrl.searchParams);

  try {
    const whereClause: Prisma.ArticleWhereInput = {};

    if (sourceFilter) {
      whereClause.source = {
        name: {
          equals: sourceFilter,
          mode: 'insensitive' as const,
        },
      };
    }

    if (hasItems(sourceIdsFilter)) {
      whereClause.sourceId = {
        in: sourceIdsFilter!,
      };
    }

    if (hasItems(biasFilter)) {
      if (whereClause.source) {
        whereClause.source.biasRating = {
          in: biasFilter!,
        };
      } else {
        whereClause.source = {
          biasRating: {
            in: biasFilter!,
          },
        };
      }
    }

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
  const sourceIdsParam = params.get('sourceIds');
  const biasParam = params.get('bias');
  const limitParam = params.get('limit');
  const pageParam = params.get('page');

  const sourceIdsFilter: string[] | null = parseArrayParam(sourceIdsParam, isValidUUID);
  const biasFilter: BiasRating[] | null = parseArrayParam(biasParam, isValidBiasRating) as BiasRating[] | null;
  const limit = parseIntParam(limitParam, 50);
  const page = parseIntParam(pageParam, 1);

  return { sourceFilter, sourceIdsFilter, biasFilter, limit, page };
}

function parseArrayParam(param: string | null, isValid: (item: string) => boolean): string[] | null {
  if (param === null) return null;

  const items = parseStringListParam(param);
  const validItems = items.filter(isValid);
  return validItems.length > 0 ? validItems : null;
}

function hasItems(target: string[] | null): boolean {
  return target !== null && target.length > 0;
}


// -------------------------------- //
// ----- POST LOGIC AND UTILS ----- // 
// -------------------------------- // 

function getCronErrorResponse(request: NextRequest) {
    const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== CRON_KEY) {
    console.error('Unauthorized attempt to update articles with invalid cron secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null
}

async function getRateLimitResponse() {
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
        { status: 429 }
      );
    }

    return null;
}

async function initHistoryRecord() {
      try {
        const historyRecord = await createUpdateHistory({
          updateType: CRON_KEY ? 'scheduled' : 'manual',
        });

        return ["ok", historyRecord];
      } catch (err) {
        console.error('Failed to create update history record:', err);
        return ["error", NextResponse.json({ error: 'Failed to create update history record' }, { status: 500 })];
      }

}