import { NextRequest, NextResponse } from 'next/server';
import { ParsedArticle, isValidBiasRating, getAllSources, parseMultipleFeeds, RSSSource, getReliability, extractDomain, extractKeywords } from '@/lib/news';
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
    
    const rssSources = getAllSources() as RSSSource[];
    console.log(`📰 Found ${rssSources.length} RSS sources`);

    // Fetch articles from RSS feeds
    console.log('📡 Fetching articles from RSS feeds...');
    const { articles, errors: fetchErrors } = await parseMultipleFeeds(rssSources);

    if (fetchErrors.length > 0) {
      console.log(`⚠️  Encountered ${fetchErrors.length} errors while fetching feeds`);
    }

    console.log(`📄 Fetched ${articles.length} total articles`);

    // Filter articles from the beginning of the previous day onwards
    const startOfPreviousDay = new Date();
    startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);
    startOfPreviousDay.setHours(0, 0, 0, 0);

    const recentArticles = (articles as ParsedArticle[]).filter(article =>
      article.publishedAt >= startOfPreviousDay
    );

    console.log(`🕒 Filtered to ${recentArticles.length} articles from ${startOfPreviousDay.toISOString()}`);

    // Upsert sources
    console.log('💾 Creating/updating sources...');
    const sourceMap = new Map<string, string>(); // sourceName -> sourceId
    let sourcesCreated = 0;
    let sourcesUpdated = 0;

    for (const rssSource of rssSources) {
      const domain = extractDomain(rssSource.url);

      try {
        // Check if source already exists
        const existingSource = await prisma.source.findUnique({
          where: { domain }
        });

        const source = await prisma.source.upsert({
          where: { domain },
          update: {
            name: rssSource.name,
            rssUrl: rssSource.url,
            biasRating: rssSource.biasRating,
            reliability: getReliability(rssSource.biasRating),
          },
          create: {
            name: rssSource.name,
            domain,
            rssUrl: rssSource.url,
            biasRating: rssSource.biasRating,
            reliability: getReliability(rssSource.biasRating),
          },
        });

        sourceMap.set(rssSource.name, source.id);

        if (existingSource) {
          sourcesUpdated++;
        } else {
          sourcesCreated++;
        }
      } catch (error) {
        console.error(`❌ Error upserting source ${rssSource.name}:`, error);
      }
    }

    console.log(`✅ Created ${sourcesCreated} sources, updated ${sourcesUpdated} sources`);

    // Upsert articles
    console.log('📝 Creating/updating articles...');
    let articlesCreated = 0;
    let articlesUpdated = 0;
    let articlesSkipped = 0;

    for (const article of recentArticles) {
      const sourceId = sourceMap.get(article.source.name);

      if (!sourceId) {
        console.log(`⚠️  Skipping article - source not found: ${article.source.name}`);
        articlesSkipped++;
        continue;
      }

      try {
        // Check if article already exists
        const existingArticle = await prisma.article.findUnique({
          where: { url: article.url }
        });

        await prisma.article.upsert({
          where: { url: article.url },
          update: {
            title: article.title,
            description: article.description,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            keywords: extractKeywords(article.title, article.description),
          },
          create: {
            title: article.title,
            description: article.description,
            url: article.url,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            sourceId,
            keywords: extractKeywords(article.title, article.description),
          },
        });

        if (existingArticle) {
          articlesUpdated++;
        } else {
          articlesCreated++;
        }
      } catch (error) {
        console.error(`❌ Error creating/updating article "${article.title}":`, error);
        articlesSkipped++;
      }
    }

    console.log(`✅ Created ${articlesCreated} articles, updated ${articlesUpdated} articles`);
    if (articlesSkipped > 0) {
      console.log(`⚠️  Skipped ${articlesSkipped} articles`);
    }

    const response = {
      success: true,
      sourcesCreated,
      sourcesUpdated,
      articlesCreated,
      articlesUpdated,
      articlesSkipped,
      errors: fetchErrors.map(e => `${e.sourceName}: ${e.error}`),
      timestamp: new Date().toISOString(),
    };

    console.log('🎉 Article update completed!');
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in POST /api/articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update articles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}