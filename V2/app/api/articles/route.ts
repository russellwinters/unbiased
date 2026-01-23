import { NextRequest, NextResponse } from 'next/server';
import { getRssData, ParsedArticle, isValidBiasRating, getAllSources, parseMultipleFeeds, RSSSource, getReliability, extractDomain, extractKeywords } from '@/lib/news';
import { prisma, upsertArticles, upsertSources } from '@/lib/db';
import { filterWithinRange, yesterdayAtMidnight } from "@/lib/utils"

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
 * Fetches articles from the database.
 * Falls back to mock data if database is unavailable or empty.
 * 
 * Query Parameters:
 * - source: (optional) Filter by source name (e.g., 'The Guardian', 'Fox News')
 * - limit: (optional) Maximum number of articles to return (default: 50)
 * 
 * Response:
 * {
 *   articles: ParsedArticle[],
 *   count: number,
 *   sources: string[],
 *   usedMockData: boolean,
 *   errors: string[],
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    return await coreLogic(request);
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return respondWith500Error({ err: error, message: 'Failed to fetch articles' });
  }
}

// TODO: update this so it's more like the post request
// with the calls pulled from utils elsewhere in the codebase
async function coreLogic(request: NextRequest) {
  const { sourceFilter, limit } = parseQueryParams(request.nextUrl.searchParams);

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

    const dbArticles = await prisma.article.findMany({
      where: whereClause,
      include: {
        source: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    const articles: ParsedArticle[] = dbArticles.map((article) => {
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
      sources,
      usedMockData: false,
      errors: [],
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    console.error('Database query failed, using mock data:', dbError);
    return respondWith500Error({ err: dbError, message: 'Internal error' });
  }
}

function parseQueryParams(params: URLSearchParams) {
  const sourceFilter = params.get('source');
  const limitParam = params.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  return { sourceFilter, limit };
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
export async function POST(request: NextRequest) {
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

function respondWith500Error({ err, message }: { err?: any, message?: string }) {
  return NextResponse.json(
    {
      error: message || 'Failed to fetch articles',
      message: err instanceof Error ? err.message : 'Unknown error'
    },
    { status: 500 }
  );
};