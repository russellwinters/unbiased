import { NextRequest, NextResponse } from 'next/server';
import { ParsedArticle, isValidBiasRating } from '@/lib/news/rss-parser';
import { prisma } from '@/lib/db';
import type { Article, Source } from '@prisma/client';
import page from '@/app/articles/page';

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
    return await coreLogic(request);
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return respondWith500Error(error);
  }
}

async function coreLogic(request: NextRequest) {
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
    return respondWith500Error(dbError);
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

function respondWith500Error(error?: unknown) {
  return NextResponse.json(
    {
      error: 'Failed to fetch articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}