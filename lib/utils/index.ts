import { ParsedArticle } from '@/lib/news/rss-parser';

export function filterWithinRange(articles: ParsedArticle[], startDate: Date, endDate?: Date): ParsedArticle[] {
  const recentArticles = (articles as ParsedArticle[]).filter(article =>
    article.publishedAt >= startDate && (endDate ? article.publishedAt <= endDate : true)
  );

  console.log(`🕒 Filtered to ${recentArticles.length} articles from ${startDate.toISOString()}`);
  return recentArticles;
}

/**
 * Counts the number of unique sources from a list of articles
 */
export function getUniqueSourceCount(articles: ParsedArticle[]): number {
  return new Set(articles.map(article => article.source.name)).size;
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function parseStringListParam(param: string): string[] {
  return param.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

export function parseIntParam(param: string | null, defaultValue: number, minValue: number = 0) {
  if (param === null) return defaultValue;

  const parsed = parseInt(param, 10);
  if (!isNaN(parsed) && parsed > minValue) {
    return parsed;
  }

  return defaultValue;
}

export function yesterdayAtMidnight(): Date {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}
