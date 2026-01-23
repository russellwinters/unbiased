import { ParsedArticle } from '@/lib/news/rss-parser';

/**
 * Counts the number of unique sources from a list of articles
 */
export function getUniqueSourceCount(articles: ParsedArticle[]): number {
  return new Set(articles.map(article => article.source.name)).size;
}

export function yesterdayAtMidnight(): Date {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}


export function filterWithinRange(articles: ParsedArticle[], startDate: Date, endDate?: Date): ParsedArticle[] {
  const recentArticles = (articles as ParsedArticle[]).filter(article =>
    article.publishedAt >= startDate && (endDate ? article.publishedAt <= endDate : true)
  );

  console.log(`🕒 Filtered to ${recentArticles.length} articles from ${startDate.toISOString()}`);
  return recentArticles;
}