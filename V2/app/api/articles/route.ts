import { NextRequest, NextResponse } from 'next/server';
import { getAllSources, parseMultipleFeeds } from '@/lib/news';
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
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceFilter = searchParams.get('source');
    const limitParam = searchParams.get('limit');
    const forceMock = searchParams.get('mock') === 'true';
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    let articles;
    let usedMockData = false;
    let sources: string[] = [];

    if (forceMock) {
      // Use mock data if explicitly requested
      articles = sourceFilter
        ? getMockArticlesBySource(sourceFilter, limit)
        : getMockArticles(limit);
      usedMockData = true;
      sources = getAllSources().map((s) => s.name);
    } else {
      // Try to fetch real RSS feeds
      const allSources = getAllSources();
      const sourcesToFetch = sourceFilter
        ? allSources.filter((s) => s.name.toLowerCase() === sourceFilter.toLowerCase())
        : allSources;

      if (sourcesToFetch.length === 0) {
        return NextResponse.json(
          { error: 'No valid sources found' },
          { status: 400 }
        );
      }

      try {
        articles = await parseMultipleFeeds(sourcesToFetch);
        sources = sourcesToFetch.map((s) => s.name);

        // If no articles were fetched, fallback to mock data
        if (articles.length === 0) {
          console.log('No articles fetched from RSS feeds, using mock data');
          articles = sourceFilter
            ? getMockArticlesBySource(sourceFilter, limit)
            : getMockArticles(limit);
          usedMockData = true;
        } else {
          // Apply limit to real data
          articles = articles.slice(0, limit);
        }
      } catch (rssError) {
        // If RSS parsing fails, fallback to mock data
        console.log('RSS parsing failed, using mock data:', rssError);
        articles = sourceFilter
          ? getMockArticlesBySource(sourceFilter, limit)
          : getMockArticles(limit);
        usedMockData = true;
        sources = allSources.map((s) => s.name);
      }
    }

    // Return response with metadata
    return NextResponse.json({
      articles,
      count: articles.length,
      sources,
      usedMockData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
