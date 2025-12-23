import { ParsedArticle } from '@/lib/news/rss-parser';

/**
 * Counts the number of unique sources from a list of articles
 */
export function getUniqueSourceCount(articles: ParsedArticle[]): number {
  return new Set(articles.map(article => article.source.name)).size;
}

