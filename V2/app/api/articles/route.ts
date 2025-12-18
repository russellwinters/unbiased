import { NextRequest, NextResponse } from 'next/server';
import { getAllSources, parseMultipleFeeds, ParseMultipleFeedsResult, RSSSource, FeedError } from '@/lib/news';
import { getMockArticles, getMockArticlesBySource } from '@/lib/news/mock-data';

/**
 * GET /api/articles
 * 
 * Fetches and parses articles from configured RSS feeds.
 * Falls back to mock data if RSS feeds cannot be accessed.
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
 *   errors: FeedError[],
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

  let articles;
  let sources: string[] = [];
  let feedErrors: { sourceName: string; error: string }[] = [];

  if (forceMock) {
    return respondWithMocks(sourceFilter, limit);
  }

  const allSources = getAllSources();
  const sourcesToFetch: RSSSource[] = sourceFilter
    ? allSources.filter((s) => s.name.toLowerCase() === sourceFilter.toLowerCase())
    : allSources;

  if (sourcesToFetch.length === 0) {
    return respondWithNoSources()
  }

  try {
    const result: ParseMultipleFeedsResult = await parseMultipleFeeds(sourcesToFetch);
    articles = result.articles;
    feedErrors = result.errors;
    sources = sourcesToFetch.map((s) => s.name);

    if (articles.length === 0) {
      return respondWithNoArticles(sources, feedErrors);
    }

    articles = articles.slice(0, limit);
  } catch (rssError) {
    console.log('RSS parsing failed, using mock data:', rssError);
    return respondWithMocks(sourceFilter, limit);
  }


  return NextResponse.json({
    articles,
    count: articles.length,
    sources,
    usedMockData: false,
    errors: feedErrors,
    timestamp: new Date().toISOString()
  });
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
  const sources = sourceFilter ? getAllSources().filter((s) => s.name.toLowerCase() === sourceFilter.toLowerCase())
    : getAllSources();

  return NextResponse.json({
    articles,
    count: articles.length,
    sources,
    usedMockData: true,
    errors: [],
    timestamp: new Date().toISOString()
  })
}

function respondWithNoSources() {
  return NextResponse.json(
    { error: 'No valid sources found' },
    { status: 400 }
  );
}

function respondWithNoArticles(sources: string[], feedErrors: FeedError[]) {
  return NextResponse.json({
    articles: [],
    count: 0,
    sources,
    usedMockData: false,
    errors: feedErrors,
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