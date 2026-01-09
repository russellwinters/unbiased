import { NextRequest, NextResponse } from 'next/server';
import { ParsedArticle, isValidBiasRating } from '@/lib/news/rss-parser';
import { prisma } from '@/lib/db';
import { getMockArticles, getMockArticlesBySource } from '@/lib/news/mock-data';

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
    return respondWith500Error(error);
  }
}

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
    return respondWith500Error();
  }
}

function parseQueryParams(params: URLSearchParams) {
  const sourceFilter = params.get('source');
  const limitParam = params.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  return { sourceFilter, limit };
}

function respondWith500Error(error?: any) {
  return NextResponse.json(
    {
      error: 'Failed to fetch articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}