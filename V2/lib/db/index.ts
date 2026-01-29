export { prisma } from './client'
export { upsertSources } from './sources';
export { upsertArticles } from './articles';

// RSS Update History
export {
  createUpdateHistory,
  completeUpdateHistory,
  failUpdateHistory,
  checkUpdateLimit,
  getUpdateCount24h,
} from './rss-update-history';
export type {
  CreateUpdateHistoryInput,
  UpdateHistoryResult,
  RateLimitCheck,
} from './rss-update-history';