import { NextRequest, NextResponse } from 'next/server';
import { getRssData, ParsedArticle, isValidBiasRating } from '@/lib/news';
import { prisma, upsertArticles, upsertSources } from '@/lib/db';
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
 * Fetches articles from the database with pagination and filtering support.
 * 
 * Query Parameters:
 * - sourceIds: (optional) Comma-separated list of source UUIDs (e.g., 'uuid-1,uuid-2')
 * - bias: (optional) Comma-separated list of bias ratings (e.g., 'left,center')
 * - source: (optional) DEPRECATED - Filter by source name (kept for backwards compatibility)
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
export async function POST(_request: NextRequest) {
  try {
    console.log('🚀 Starting article update from RSS feeds...');

    const { sources, articles, rssErrors } = await getRssData();
    const recentArticles = filterWithinRange(articles, yesterdayAtMidnight());

    const { sourceMap, sourcesCreated, sourcesUpdated } = await upsertSources(sources);
    const { articlesCreated, articlesUpdated, articlesSkipped } = await upsertArticles(recentArticles, sourceMap);

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
  } catch (error) {
    console.error('❌ Error in POST /api/articles:', error);
    return respondWith500Error({ err: error, message: 'Failed to update articles' });
  }
}

function respondWith500Error({ err, message }: { err?: unknown, message?: string }) {
  return NextResponse.json(
    {
      error: message || 'Failed to fetch articles',
      message: err instanceof Error ? err.message : 'Unknown error'
    },
    { status: 500 }
  );
}

// TODO: update this so it's more like the post request
// with the calls pulled from utils elsewhere in the codebase
async function coreGetLogic(request: NextRequest) {
  const { sourceFilter, sourceIdsFilter, biasFilter, limit, page } = parseQueryParams(request.nextUrl.searchParams);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // New filter: Filter by source IDs (indexed field for optimal performance)
    if (sourceIdsFilter && sourceIdsFilter.length > 0) {
      whereClause.sourceId = {
        in: sourceIdsFilter,
      };
    }
    // Legacy filter: Filter by source name (deprecated, kept for backwards compatibility)
    else if (sourceFilter) {
      whereClause.source = {
        name: {
          equals: sourceFilter,
          mode: 'insensitive' as const,
        },
      };
    }

    // Filter by bias rating (via source relation)
    if (biasFilter && biasFilter.length > 0) {
      // If we're already filtering by sourceIds, we need to combine filters
      if (whereClause.sourceId) {
        // Use AND condition to combine sourceId filter with bias filter
        whereClause.source = {
          biasRating: {
            in: biasFilter,
          },
        };
      } else {
        // If no sourceId filter, just filter by bias
        whereClause.source = whereClause.source || {};
        whereClause.source.biasRating = {
          in: biasFilter,
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
  const sourceFilter = params.get('source'); // Deprecated, kept for backwards compatibility
  const sourceIdsParam = params.get('sourceIds');
  const biasParam = params.get('bias');
  const limitParam = params.get('limit');
  const pageParam = params.get('page');

  // Parse sourceIds - comma-separated list of UUIDs
  const sourceIdsFilter = sourceIdsParam
    ? sourceIdsParam.split(',').map(id => id.trim()).filter(id => isValidUUID(id))
    : null;

  // Parse bias - comma-separated list of bias ratings
  const biasFilter = biasParam
    ? biasParam.split(',').map(b => b.trim()).filter(b => isValidBiasRating(b))
    : null;

  const limit = parseIntParam(limitParam, 50);
  const page = parseIntParam(pageParam, 1);

  return { sourceFilter, sourceIdsFilter, biasFilter, limit, page };
}

function parseIntParam(param: string | null, defaultValue: number, minValue: number = 0) {
  if (param === null) return defaultValue;

  const parsed = parseInt(param, 10);
  if (!isNaN(parsed) && parsed > minValue) {
    return parsed;
  }

  return defaultValue;
}

/**
 * Validates if a string is a valid UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}