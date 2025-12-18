import Parser from 'rss-parser';
import { RSSSource } from './rss-sources';

// Define the structure of a parsed article
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

// Custom RSS parser with additional fields
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
  'media:content'?: {
    $?: {
      url?: string;
    };
  };
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

/**
 * Extracts image URL from RSS item
 */
function extractImageUrl(item: CustomItem): string | null {
  // Try media:content
  if (item['media:content'] && typeof item['media:content'] === 'object') {
    const mediaContent = item['media:content'] as { $?: { url?: string } };
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
 */
function extractDescription(item: CustomItem): string | null {
  // Prefer contentSnippet (cleaned text)
  if (item.contentSnippet) {
    return item.contentSnippet.trim();
  }

  // Fall back to description, strip HTML tags
  if (item.description) {
    return item.description.replace(/<[^>]*>/g, '').trim();
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
        return {
          title: item.title || 'Untitled',
          description: extractDescription(item),
          url: item.link || '',
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
 * Parses multiple RSS feeds concurrently
 */
export async function parseMultipleFeeds(sources: RSSSource[]): Promise<ParsedArticle[]> {
  const results = await Promise.allSettled(
    sources.map((source) => parseRSSFeed(source))
  );

  const allArticles: ParsedArticle[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    } else {
      console.error(`Failed to fetch from ${sources[index].name}:`, result.reason);
    }
  });

  // Sort by published date, newest first
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return allArticles;
}
