import Parser from 'rss-parser';
import { RSSSource } from './rss-sources';

export interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  source: {
    name: string;
    biasRating: string;
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
 * Extracts image URL from RSS item
 */
function extractImageUrl(item: CustomItem): string | null {
  // Try media:content
  if (item['media:content'] && isMediaContent(item['media:content'])) {
    const mediaContent = item['media:content'];
    if (mediaContent.$?.url) {
      return mediaContent.$.url;
    }
  }

  // Try enclosure
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  // Try to extract from content:encoded or description using regex
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
  // Prefer contentSnippet (cleaned text)
  if (item.contentSnippet) {
    return item.contentSnippet.trim();
  }

  // Fall back to description, remove HTML tags for plain text extraction
  // This is not for sanitization - proper escaping must happen at render time
  if (item.description) {
    // More robust HTML tag removal that handles broken tags
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

    const articles: ParsedArticle[] = feed.items
      .filter((item) => item.title && item.link)
      .map((item) => {
        // Safe to assert non-null because of filter above
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
    // TODO: figure out why we're seeing errors parsing from MSNBC, Reuters, Associated Press, and USA Today

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

  // Sort by published date, newest first
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return {
    articles: allArticles,
    errors
  };
}
