# RSS Update History: Rate Limiting Plan

## Overview

This document outlines the plan to implement rate limiting for the POST /api/articles endpoint by adding an `rssUpdateHistory` table to track update frequency. The goal is to limit RSS feed updates to **3 times per 24-hour period** to reduce unnecessary API calls and server load.

## Current State

### Existing Endpoint: POST /api/articles

**Location:** `/V2/app/api/articles/route.ts`

**Current Behavior:**

- Fetches articles from all RSS sources (15 sources configured in `lib/news/rss-sources.ts`)
- Filters articles to include only those published since yesterday at midnight
- Upserts sources and articles into the database
- No rate limiting or update frequency tracking
- Can be called repeatedly without restriction

**Data Flow:**

1. Client calls POST /api/articles
2. `getRssData()` fetches from all RSS feeds
3. `filterWithinRange()` filters articles by date
4. `upsertSources()` creates/updates sources
5. `upsertArticles()` creates/updates articles
6. Response includes counts and errors

---

## Proposed Solution

### Database Schema

#### New Table: `rssUpdateHistory`

```prisma
model RSSUpdateHistory {
  id          String    @id @default(uuid())
  updateType  String    // "manual" or "scheduled" for tracking request source
  requestedAt DateTime  @default(now())  // UTC timestamp when update was requested
  startedAt   DateTime  // UTC timestamp when RSS fetching started
  completedAt DateTime? // UTC timestamp when update completed (null if in progress/failed)
  status      String    // "in_progress", "completed", "failed"
  
  // Statistics
  sourcesCreated  Int @default(0)
  sourcesUpdated  Int @default(0)
  articlesCreated Int @default(0)
  articlesUpdated Int @default(0)
  articlesSkipped Int @default(0)
  
  // Error tracking
  errorCount      Int      @default(0)
  errorMessages   String[] @default([])
  
  // Duration tracking (in milliseconds)
  duration        Int?
  
  @@index([requestedAt])
  @@index([completedAt])
}
```

**Design Rationale:**

1. **Timestamps in UTC:** All timestamps use PostgreSQL's native timestamp handling with Prisma's `DateTime` type, which stores in UTC by default.

2. **Detailed Statistics:** Captures the same metrics currently returned by the endpoint for historical analysis.

3. **Error Tracking:** Preserves error information for debugging and monitoring feed reliability.

4. **Duration Tracking:** Enables performance monitoring and optimization.

5. **Update Type:** Distinguishes between manual API calls and scheduled/automated updates (for future cron jobs).

6. **Indexes:** Optimized for the most common query patterns:
   - `requestedAt` - For checking recent updates in 24hr window
   - `completedAt` - For historical reporting

---

## Migration Strategy

### Step 1: Create Migration File

**Command:**

```bash
cd V2
npm run db:migrate
# Enter migration name: add_rss_update_history
```

This will generate a new migration in `prisma/migrations/` directory.

### Step 2: Schema Update

Add the `RSSUpdateHistory` model to `/V2/prisma/schema.prisma` (see schema above).

### Step 3: Apply Migration

The `npm run db:migrate` command will:

1. Generate the migration SQL
2. Apply it to the local database
3. Update the Prisma Client types

### Step 4: Verify Migration

```bash
# Check the database
npm run db:studio

# Or use psql
docker compose exec postgres psql -U unbiased -d unbiased -c "\d \"RSSUpdateHistory\""
```

### Migration SQL Preview

The generated migration will include:

```sql
-- CreateTable
CREATE TABLE "RSSUpdateHistory" (
    "id" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "sourcesCreated" INTEGER NOT NULL DEFAULT 0,
    "sourcesUpdated" INTEGER NOT NULL DEFAULT 0,
    "articlesCreated" INTEGER NOT NULL DEFAULT 0,
    "articlesUpdated" INTEGER NOT NULL DEFAULT 0,
    "articlesSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration" INTEGER,

    CONSTRAINT "RSSUpdateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RSSUpdateHistory_requestedAt_idx" ON "RSSUpdateHistory"("requestedAt");

-- CreateIndex
CREATE INDEX "RSSUpdateHistory_completedAt_idx" ON "RSSUpdateHistory"("completedAt");
```

---

## Technical Implementation

### Phase 1: Database Layer

**Location:** `/V2/lib/db/rss-update-history/`

Create new module structure:

```
lib/db/rss-update-history/
├── index.ts       # Public API exports
├── create.ts      # Create new update record
├── update.ts      # Update existing record
└── check-limit.ts # Check rate limit
```

#### File: `create.ts`

```typescript
import { prisma } from '../client';
import type { RSSUpdateHistory } from '@prisma/client';

export interface CreateUpdateHistoryInput {
  updateType: 'manual' | 'scheduled';
}

/**
 * Creates a new update history record with "in_progress" status
 */
export async function createUpdateHistory(
  input: CreateUpdateHistoryInput
): Promise<RSSUpdateHistory> {
  const now = new Date();
  
  return await prisma.rSSUpdateHistory.create({
    data: {
      updateType: input.updateType,
      requestedAt: now,
      startedAt: now,
      status: 'in_progress',
    },
  });
}
```

#### File: `update.ts`

```typescript
import { prisma } from '../client';
import type { RSSUpdateHistory } from '@prisma/client';

export interface UpdateHistoryResult {
  sourcesCreated: number;
  sourcesUpdated: number;
  articlesCreated: number;
  articlesUpdated: number;
  articlesSkipped: number;
  errorMessages: string[];
}

/**
 * Updates an existing history record with completion data
 */
export async function completeUpdateHistory(
  id: string,
  result: UpdateHistoryResult,
  startTime: Date
): Promise<RSSUpdateHistory> {
  const completedAt = new Date();
  const duration = completedAt.getTime() - startTime.getTime();
  
  return await prisma.rSSUpdateHistory.update({
    where: { id },
    data: {
      status: 'completed',
      completedAt,
      duration,
      sourcesCreated: result.sourcesCreated,
      sourcesUpdated: result.sourcesUpdated,
      articlesCreated: result.articlesCreated,
      articlesUpdated: result.articlesUpdated,
      articlesSkipped: result.articlesSkipped,
      errorCount: result.errorMessages.length,
      errorMessages: result.errorMessages,
    },
  });
}

/**
 * Marks an update as failed
 */
export async function failUpdateHistory(
  id: string,
  error: string,
  startTime: Date
): Promise<RSSUpdateHistory> {
  const completedAt = new Date();
  const duration = completedAt.getTime() - startTime.getTime();
  
  return await prisma.rSSUpdateHistory.update({
    where: { id },
    data: {
      status: 'failed',
      completedAt,
      duration,
      errorCount: 1,
      errorMessages: [error],
    },
  });
}
```

#### File: `check-limit.ts`

```typescript
import { prisma } from '../client';

export interface RateLimitCheck {
  allowed: boolean;
  updatesToday: number;
  limit: number;
  nextAllowedTime?: Date;
}

const DAILY_UPDATE_LIMIT = 3;
const HOURS_IN_DAY = 24;

/**
 * Checks if an RSS update is allowed based on rate limit
 * 
 * @returns RateLimitCheck object with allowed status and metadata
 */
export async function checkUpdateLimit(): Promise<RateLimitCheck> {
  // Calculate 24 hours ago from now (UTC)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - HOURS_IN_DAY);
  
  // Count completed updates in the last 24 hours
  const recentUpdates = await prisma.rSSUpdateHistory.findMany({
    where: {
      requestedAt: {
        gte: twentyFourHoursAgo,
      },
      status: 'completed', // Only count successful updates
    },
    orderBy: {
      requestedAt: 'asc',
    },
    select: {
      requestedAt: true,
    },
  });
  
  const updatesToday = recentUpdates.length;
  const allowed = updatesToday < DAILY_UPDATE_LIMIT;
  
  // Calculate next allowed time if limit is reached
  let nextAllowedTime: Date | undefined;
  if (!allowed && recentUpdates.length > 0) {
    // The next update is allowed 24 hours after the oldest update in the window
    const oldestUpdate = recentUpdates[0].requestedAt;
    nextAllowedTime = new Date(oldestUpdate.getTime() + HOURS_IN_DAY * 60 * 60 * 1000);
  }
  
  return {
    allowed,
    updatesToday,
    limit: DAILY_UPDATE_LIMIT,
    nextAllowedTime,
  };
}

/**
 * Gets the count of updates in the last 24 hours
 */
export async function getUpdateCount24h(): Promise<number> {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - HOURS_IN_DAY);
  
  return await prisma.rSSUpdateHistory.count({
    where: {
      requestedAt: {
        gte: twentyFourHoursAgo,
      },
      status: 'completed',
    },
  });
}
```

#### File: `index.ts`

```typescript
export { createUpdateHistory } from './create';
export { completeUpdateHistory, failUpdateHistory } from './update';
export { checkUpdateLimit, getUpdateCount24h } from './check-limit';
export type { CreateUpdateHistoryInput } from './create';
export type { UpdateHistoryResult } from './update';
export type { RateLimitCheck } from './check-limit';
```

### Phase 2: API Endpoint Updates

**Location:** `/V2/app/api/articles/route.ts`

#### Modified POST Handler

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Checking rate limit for article update...');
    
    // Check rate limit FIRST
    const rateLimitCheck = await checkUpdateLimit();
    
    if (!rateLimitCheck.allowed) {
      console.log(`⚠️ Rate limit exceeded: ${rateLimitCheck.updatesToday}/${rateLimitCheck.limit} updates in 24h`);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `RSS feed updates are limited to ${rateLimitCheck.limit} per 24-hour period. ${rateLimitCheck.updatesToday} updates have already been performed.`,
          updatesToday: rateLimitCheck.updatesToday,
          limit: rateLimitCheck.limit,
          nextAllowedTime: rateLimitCheck.nextAllowedTime?.toISOString(),
          timestamp: new Date().toISOString(),
        },
        { status: 429 } // Too Many Requests
      );
    }
    
    console.log('✅ Rate limit check passed, starting update...');
    
    // Create history record
    const historyRecord = await createUpdateHistory({
      updateType: 'manual', // Could be detected from headers/auth in future
    });
    
    const startTime = new Date();
    
    try {
      // Existing RSS fetch logic
      const { sources, articles, rssErrors } = await getRssData();
      const recentArticles = filterWithinRange(articles, yesterdayAtMidnight());
      
      const { sourceMap, sourcesCreated, sourcesUpdated } = await upsertSources(sources);
      const { articlesCreated, articlesUpdated, articlesSkipped } = await upsertArticles(recentArticles, sourceMap);
      
      // Update history record with success
      await completeUpdateHistory(
        historyRecord.id,
        {
          sourcesCreated,
          sourcesUpdated,
          articlesCreated,
          articlesUpdated,
          articlesSkipped,
          errorMessages: rssErrors.map(e => `${e.sourceName}: ${e.error}`),
        },
        startTime
      );
      
      const response: ArticleUpdateResponse = {
        success: true,
        sourcesCreated,
        sourcesUpdated,
        articlesCreated,
        articlesUpdated,
        articlesSkipped,
        errors: rssErrors.map(e => `${e.sourceName}: ${e.error}`),
        timestamp: new Date().toISOString(),
      };
      
      console.log('🎉 Article update completed!');
      return NextResponse.json(response, { status: 200 });
      
    } catch (updateError) {
      // Update history record with failure
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      await failUpdateHistory(historyRecord.id, errorMessage, startTime);
      throw updateError; // Re-throw to be caught by outer catch
    }
    
  } catch (error) {
    console.error('❌ Error in POST /api/articles:', error);
    return respondWith500Error({ err: error, message: 'Failed to update articles' });
  }
}
```

### Phase 3: Update Database Index

Update `/V2/lib/db/index.ts` to export the new functions:

```typescript
// Add to existing exports
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
```

---

## API Response Changes

### New Response: Rate Limit Exceeded (429)

When rate limit is exceeded, the endpoint will return:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "RSS feed updates are limited to 3 per 24-hour period. 3 updates have already been performed.",
  "updatesToday": 3,
  "limit": 3,
  "nextAllowedTime": "2026-01-29T02:30:00.000Z",
  "timestamp": "2026-01-28T15:45:00.000Z"
}
```

**HTTP Status Code:** 429 Too Many Requests

### Existing Success Response (200)

No changes to the existing success response format. The endpoint continues to return the same structure.

---

## Configuration Options

### Environment Variables (Optional Future Enhancement)

For flexibility, the rate limit could be made configurable:

```env
# .env
RSS_UPDATE_LIMIT=3           # Number of updates allowed per period
RSS_UPDATE_PERIOD_HOURS=24   # Time window in hours
```

**Implementation:**

```typescript
const DAILY_UPDATE_LIMIT = parseInt(process.env.RSS_UPDATE_LIMIT || '3', 10);
const HOURS_IN_DAY = parseInt(process.env.RSS_UPDATE_PERIOD_HOURS || '24', 10);
```

---

## Testing Strategy

### Unit Tests

1. **Rate Limit Logic:**
   - Test with 0, 1, 2, 3, 4 updates in last 24 hours
   - Test with updates older than 24 hours (should not count)
   - Test `nextAllowedTime` calculation
   - Test with failed updates (should not count toward limit)

2. **History Record Creation:**
   - Test creating new record with correct timestamps
   - Test status transitions: in_progress → completed
   - Test status transitions: in_progress → failed

### Integration Tests

1. **POST /api/articles:**
   - Call endpoint 3 times successfully
   - Verify 4th call returns 429
   - Wait 24 hours (or mock time), verify 4th call succeeds
   - Verify history records are created correctly

2. **Database:**
   - Verify indexes exist
   - Verify query performance with large dataset
   - Test concurrent requests

### Manual Testing

```bash
# Test rate limiting
for i in {1..4}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/articles
  echo "\n---\n"
done

# Check history records
npm run db:studio
# Navigate to RSSUpdateHistory table
```

---

## Monitoring & Observability

### Recommended Metrics to Track

1. **Rate Limit Hits:**
   - Count of 429 responses
   - Distribution of when limits are hit

2. **Update Success Rate:**
   - Ratio of completed vs. failed updates
   - Average duration per update

3. **Feed Health:**
   - Per-source error rates from `errorMessages`
   - Sources with consistent failures

### Database Queries for Monitoring

```typescript
// Get update statistics for last 7 days
const stats = await prisma.rSSUpdateHistory.groupBy({
  by: ['status'],
  where: {
    requestedAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
  _count: true,
  _avg: {
    duration: true,
    articlesCreated: true,
  },
});

// Get recent failed updates
const failures = await prisma.rSSUpdateHistory.findMany({
  where: {
    status: 'failed',
    requestedAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  select: {
    requestedAt: true,
    errorMessages: true,
    duration: true,
  },
});
```

---

## Future Enhancements

### 1. Admin Override Endpoint

Create a way for admins to bypass rate limits:

```typescript
// POST /api/admin/articles/force-update
// Requires authentication & admin role
```

### 2. Source-Level Rate Limiting

Instead of limiting all RSS updates, limit per-source:

```typescript
// Track last update time per source
// Allow more frequent updates for high-priority sources
```

### 3. Scheduled Updates

Implement a cron job or scheduled task:

```typescript
// Mark as updateType: "scheduled"
// Run at optimal times (e.g., 6am, 12pm, 6pm UTC)
```

### 4. Webhook Notifications

Notify when rate limit is reached:

```typescript
// Send webhook/email when limit hit
// Alert on consecutive failures
```

### 5. Historical Analytics Dashboard

Build UI to visualize:

- Update frequency over time
- Success/failure rates
- Performance metrics (duration trends)
- Source reliability scores

---

## Migration Rollout Plan

### Pre-Migration Checklist

- [ ] Review and approve schema design
- [ ] Test migration on development database
- [ ] Create backup of production database
- [ ] Schedule maintenance window (if needed)

### Migration Steps

1. **Development Environment:**

   ```bash
   cd V2
   npm run db:migrate
   # Enter name: add_rss_update_history
   npm run db:generate
   ```

2. **Testing:**
   - Run integration tests
   - Manual testing of rate limiting
   - Verify no breaking changes

3. **Code Deployment:**
   - Deploy new code with rate limiting logic
   - Monitor error logs and metrics

4. **Production Migration:**

   ```bash
   # In production environment
   npm run db:migrate
   npm run db:generate
   ```

5. **Post-Migration Verification:**
   - Check database schema: `\d "RSSUpdateHistory"`
   - Test POST /api/articles endpoint
   - Monitor for errors in first 24 hours

### Rollback Plan

If issues arise:

1. **Code Rollback:**
   - Revert to previous version
   - The table will exist but be unused (safe)

2. **Database Rollback (if necessary):**

   ```sql
   DROP TABLE "RSSUpdateHistory";
   ```

   - Note: This is destructive and should only be done if table is causing issues

---

## Documentation Updates Required

After implementation, update these files:

1. **`/V2/docs/API_DOCUMENTATION.md`:**
   - Add 429 response documentation
   - Document rate limit behavior
   - Add `nextAllowedTime` field explanation

2. **`/V2/docs/DATABASE_SETUP.md`:**
   - Add `RSSUpdateHistory` table description
   - Document monitoring queries

3. **`/V2/README.md`:**
   - Mention rate limiting feature
   - Link to this planning document

---

## Dependencies

### Required Packages (Already Installed)

- `@prisma/client` - Database ORM
- `next` - API routing framework
- `date-fns` (optional) - For date manipulation helpers

### No New Dependencies Required

The implementation uses only existing dependencies in the project.

---

## Security Considerations

### 1. UTC Timestamps

All timestamps are stored in UTC to prevent timezone-related bugs:

- Prisma automatically handles UTC conversion
- PostgreSQL `TIMESTAMP` stores in UTC
- JavaScript `Date` objects are converted properly

### 2. Race Conditions

Potential issue: Multiple simultaneous requests could bypass rate limit.

**Mitigation Strategy:**

- Use database transaction isolation
- Consider implementing distributed lock (Redis) for high-traffic scenarios
- PostgreSQL's MVCC handles concurrent reads safely

**For Current Scale:** Database-level checks are sufficient.

### 3. Failed Updates

Failed updates do not count toward the rate limit:

- Only `status: 'completed'` updates are counted
- Prevents DOS-like scenarios where failures block future attempts

### 4. Manual vs. Scheduled Updates

Tracking `updateType` allows future differentiation:

- Could apply different limits to manual vs. automated
- Enables auditing who/what triggered updates

---

## Performance Considerations

### Database Query Performance

The rate limit check query is optimized:

- Uses index on `requestedAt` for fast date filtering
- Uses index on `status` for status filtering
- Typical query time: <10ms with proper indexes

### Cache Consideration (Future)

For high-traffic scenarios, cache the rate limit status:

```typescript
// Cache for 5 minutes to reduce DB hits
// Invalidate on successful update
const cachedRateLimitCheck = await cache.get('rss-rate-limit');
```

**Current Decision:** Not needed for current scale (manual updates).

---

## Success Criteria

Implementation is successful when:

1. ✅ Database migration applies cleanly
2. ✅ POST /api/articles enforces 3-update limit per 24 hours
3. ✅ Rate limit check executes in <50ms
4. ✅ History records are created for each update attempt
5. ✅ 429 response includes `nextAllowedTime`
6. ✅ Failed updates don't count toward limit
7. ✅ Existing functionality continues to work
8. ✅ All timestamps are in UTC
9. ✅ No performance degradation to endpoint
10. ✅ Documentation is updated

---

## Timeline Estimate

### Implementation Phases

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Schema design, migration creation | 1-2 hours |
| **Phase 2** | Database layer implementation | 2-3 hours |
| **Phase 3** | API endpoint updates | 1-2 hours |
| **Phase 4** | Testing (unit + integration) | 2-3 hours |
| **Phase 5** | Documentation updates | 1 hour |
| **Total** | | **7-11 hours** |

### Rollout Schedule

- **Day 1:** Implementation and testing in development
- **Day 2:** Code review and QA
- **Day 3:** Production deployment
- **Day 4-7:** Monitoring and adjustments

---

## Questions & Considerations

### Open Questions

1. **Should scheduled/automated updates have a different limit?**
   - Current plan: Same 3/24hr limit for all update types
   - Alternative: Allow scheduled updates to bypass/have higher limit

2. **Should there be a way to force an update?**
   - Potential admin endpoint: POST /api/admin/articles/force-update
   - Would bypass rate limit (requires authentication)

3. **What should happen to existing history after 30/60/90 days?**
   - Consider archiving old records
   - Add cleanup job to delete records >90 days old

4. **Should rate limit be configurable via admin UI?**
   - Current plan: Hardcoded constant
   - Future: Admin panel to adjust limit

### Assumptions

1. **Manual updates only:** Currently, all updates are manual API calls
2. **Single server:** No distributed system concerns yet
3. **Low traffic:** 3 updates/day is sufficient for current needs
4. **PostgreSQL:** All database features assume PostgreSQL

---

## Conclusion

This plan provides a comprehensive approach to implementing rate limiting for RSS feed updates using a new `rssUpdateHistory` table. The solution is:

- **Simple:** Straightforward database-backed rate limiting
- **Reliable:** Uses PostgreSQL's ACID guarantees
- **Observable:** Tracks detailed metrics for monitoring
- **Maintainable:** Clear separation of concerns
- **Extensible:** Easy to adjust limits or add features

The implementation requires no new dependencies and integrates cleanly with the existing Next.js and Prisma architecture.

---

## Appendix: Related Files

### Files to Create

- `/V2/lib/db/rss-update-history/index.ts`
- `/V2/lib/db/rss-update-history/create.ts`
- `/V2/lib/db/rss-update-history/update.ts`
- `/V2/lib/db/rss-update-history/check-limit.ts`

### Files to Modify

- `/V2/prisma/schema.prisma` - Add RSSUpdateHistory model
- `/V2/app/api/articles/route.ts` - Add rate limiting logic
- `/V2/lib/db/index.ts` - Export new functions
- `/V2/docs/API_DOCUMENTATION.md` - Document 429 response
- `/V2/docs/DATABASE_SETUP.md` - Add table description

### Files to Reference

- `/V2/lib/news/rss-sources.ts` - RSS source configuration
- `/V2/lib/news/rss-parser.ts` - RSS parsing logic
- `/V2/lib/db/articles/upsert.ts` - Article upsert pattern
- `/V2/lib/db/sources/upsert.ts` - Source upsert pattern

---

**Document Version:** 1.0  
**Created:** 2026-01-28  
**Last Updated:** 2026-01-28  
**Author:** Planning Team  
**Status:** Draft for Review
