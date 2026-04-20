import Parser from 'rss-parser';
import { RSSSource, getAllSources } from './rss-sources';

export type BiasRating = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';

export function isValidBiasRating(value: string): value is BiasRating {
  return ['left', 'lean-left', 'center', 'lean-right', 'right'].includes(value);
}

export interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  source: {
    name: string;
    biasRating: BiasRating;
  };
}

export interface FeedError {
  sourceName: string;
  error: string;
}

export interface ParseMultipleFeedsResult {
  articles: ParsedArticle[];
  errors: FeedError[];
}

interface CustomFeed {
  [key: string]: unknown;
}

interface CustomItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  'content:encoded'?: string;
  description?: string;
  'media:content'?: unknown;
  enclosure?: {
    url?: string;
  };
  [key: string]: unknown;
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['content:encoded', 'content:encoded']
    ]
  }
});

interface MediaContent {
  $?: {
    url?: string;
  };
}

/**
 * Type guard to check if value is a MediaContent object
 */
function isMediaContent(value: unknown): value is MediaContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$' in value &&
    typeof (value as MediaContent).$ === 'object'
  );
}

/**
 * Extracts image URL from RSS item, through media:content, enclosure, or attempted HTML content extraction
 */
function extractImageUrl(item: CustomItem): string | null {
  if (item['media:content'] && isMediaContent(item['media:content'])) {
    const mediaContent = item['media:content'];
    if (mediaContent.$?.url) {
      return mediaContent.$.url;
    }
  }

  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  const contentToSearch = item['content:encoded'] || item.description || '';
  if (typeof contentToSearch === 'string') {
    const imgMatch = contentToSearch.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  return null;
}

/**
 * Extracts clean description text from RSS item
 * Note: This is for extracting plain text from RSS feeds, not for XSS prevention.
 * All content must be properly escaped when rendered in the browser.
 */
function extractDescription(item: CustomItem): string | null {
  // Preferred/standard
  if (item.contentSnippet) {
    return item.contentSnippet.trim();
  }

  // Fallback
  if (item.description) {
    const cleaned = item.description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Decode common entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    return cleaned || null;
  }

  return null;
}

/**
 * Parses an RSS feed from a given source
 */
export async function parseRSSFeed(source: RSSSource): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);

    if (!isValidBiasRating(source.biasRating)) {
      throw new Error(`Invalid bias rating for source ${source.name}: ${source.biasRating}`);
    }

    const articles: ParsedArticle[] = feed.items
      .filter((item) => item.title && item.link)
      .map((item) => {
        return {
          title: item.title!,
          description: extractDescription(item),
          url: item.link!,
          imageUrl: extractImageUrl(item),
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: {
            name: source.name,
            biasRating: source.biasRating
          }
        };
      });

    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed for ${source.name}:`, error);
    throw new Error(`Failed to parse RSS feed for ${source.name}`);
  }
}

/**
 * Parses multiple RSS feeds concurrently and tracks errors
 */
export async function parseMultipleFeeds(sources: RSSSource[]): Promise<ParseMultipleFeedsResult> {
  const results = await Promise.allSettled(
    sources.map((source) => parseRSSFeed(source))
  );

  const allArticles: ParsedArticle[] = [];
  const errors: FeedError[] = [];

  // TODO: convert this to a reduce function, returning allArticles and errors in destructured const
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    } else {
      const errorMessage = result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
      errors.push({
        sourceName: sources[index].name,
        error: errorMessage
      });
      console.error(`Failed to fetch from ${sources[index].name}:`, result.reason);
    }
  });

  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return {
    articles: allArticles,
    errors
  };
}

export async function getRssData(): Promise<{ sources: RSSSource[], articles: ParsedArticle[], rssErrors: FeedError[] }> {
  const rssSources = getAllSources() as RSSSource[];
  console.log(`📰 Found ${rssSources.length} RSS sources`);

  console.log('📡 Fetching articles from RSS feeds...');
  const { articles, errors: fetchErrors } = await parseMultipleFeeds(rssSources);

  if (fetchErrors.length > 0) {
    console.log(`⚠️  Encountered ${fetchErrors.length} errors while fetching feeds`);
  }

  console.log(`📄 Fetched ${articles.length} total articles`);
  return { sources: rssSources, articles, rssErrors: fetchErrors };
}