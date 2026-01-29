import { NextRequest, NextResponse } from 'next/server';
import { getRssData, ParsedArticle, isValidBiasRating, BiasRating } from '@/lib/news';
import { prisma, upsertArticles, upsertSources } from '@/lib/db';
import { filterWithinRange, yesterdayAtMidnight } from "@/lib/utils"
import type { Article, Source, Prisma } from '@prisma/client';

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
};

// TODO: update this so it's more like the post request
// with the calls pulled from utils elsewhere in the codebase
async function coreGetLogic(request: NextRequest) {
  const { sourceFilter, sourceIdsFilter, biasFilter, limit, page } = parseQueryParams(request.nextUrl.searchParams);

  try {
    const whereClause: Prisma.ArticleWhereInput = {};

    // Support legacy source name filter (deprecated)
    if (sourceFilter) {
      whereClause.source = {
        name: {
          equals: sourceFilter,
          mode: 'insensitive' as const,
        },
      };
    }

    // Filter by source IDs (indexed field - optimal performance)
    if (sourceIdsFilter && sourceIdsFilter.length > 0) {
      whereClause.sourceId = {
        in: sourceIdsFilter,
      };
    }

    // Filter by bias rating (via source relation)
    if (biasFilter && biasFilter.length > 0) {
      // If we already have a source filter, merge the biasRating condition
      if (whereClause.source) {
        whereClause.source.biasRating = {
          in: biasFilter,
        };
      } else {
        whereClause.source = {
          biasRating: {
            in: biasFilter,
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

  // Parse and validate source IDs
  let sourceIdsFilter: string[] | null = null;
  if (sourceIdsParam) {
    const ids = sourceIdsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);
    // Validate UUID format (basic validation)
    const validIds = ids.filter(id => isValidUUID(id));
    if (validIds.length > 0) {
      sourceIdsFilter = validIds;
    }
  }

  // Parse and validate bias ratings
  let biasFilter: BiasRating[] | null = null;
  if (biasParam) {
    const biases = biasParam.split(',').map(b => b.trim()).filter(b => b.length > 0);
    const validBiases = biases.filter(b => isValidBiasRating(b)) as BiasRating[];
    if (validBiases.length > 0) {
      biasFilter = validBiases;
    }
  }

  const limit = parseIntParam(limitParam, 50);
  const page = parseIntParam(pageParam, 1);

  return { sourceFilter, sourceIdsFilter, biasFilter, limit, page };
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function parseIntParam(param: string | null, defaultValue: number, minValue: number = 0) {
  if (param === null) return defaultValue;

  const parsed = parseInt(param, 10);
  if (!isNaN(parsed) && parsed > minValue) {
    return parsed;
  }

  return defaultValue;
}