// News aggregation and RSS feed utilities
export { rssSources, getAllSources, getSourceByKey } from './rss-sources';
export type { RSSSource } from './rss-sources';
export { parseRSSFeed, parseMultipleFeeds } from './rss-parser';
export type { ParsedArticle } from './rss-parser';
export { getMockArticles, getMockArticlesBySource, mockArticles } from './mock-data';
