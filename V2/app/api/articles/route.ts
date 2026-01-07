import { NextRequest, NextResponse } from 'next/server';
import { ParsedArticle, BiasRating } from '@/lib/news/rss-parser';
import { prisma } from '@/lib/db';
import { getMockArticles, getMockArticlesBySource } from '@/lib/news/mock-data';

/**
 * Validates if a string is a valid BiasRating
 */
function isValidBiasRating(value: string): value is BiasRating {
  return ['left', 'lean-left', 'center', 'lean-right', 'right'].includes(value);
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
 * - mock: (optional) Force use of mock data (set to 'true')
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
    return respondWith500Error(error);
  }
}


async function coreLogic(request: NextRequest) {
  const { forceMock, sourceFilter, limit } = parseQueryParams(request.nextUrl.searchParams);

  if (forceMock) {
    return respondWithMocks(sourceFilter, limit);
  }

  try {
    // Build where clause for optional source filter
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

    // Fetch articles from database with source relation
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

    // If no articles in database, fall back to mock data
    if (dbArticles.length === 0) {
      console.log('No articles found in database, using mock data');
      return respondWithMocks(sourceFilter, limit);
    }

    // Transform database articles to ParsedArticle format
    const articles: ParsedArticle[] = dbArticles.map((article) => {
      // Validate and default bias rating if invalid
      const biasRating = isValidBiasRating(article.source.biasRating)
        ? article.source.biasRating
        : 'center'; // Default to center if invalid

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

    // Get unique source names
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
    return respondWithMocks(sourceFilter, limit);
  }
}

function parseQueryParams(params: URLSearchParams) {
  const forceMock = params.get('mock') === 'true';
  const sourceFilter = params.get('source');
  const limitParam = params.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  return { forceMock, sourceFilter, limit };
}

function respondWithMocks(sourceFilter?: string | null, limit?: number) {
  const articles = sourceFilter
    ? getMockArticlesBySource(sourceFilter, limit)
    : getMockArticles(limit);
  const sources = [...new Set(articles.map((a) => a.source.name))];

  return NextResponse.json({
    articles,
    count: articles.length,
    sources,
    usedMockData: true,
    errors: [],
    timestamp: new Date().toISOString()
  });
}




function respondWith500Error(error: any) {
  return NextResponse.json(
    {
      error: 'Failed to fetch articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}