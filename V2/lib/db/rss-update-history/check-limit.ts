import { prisma } from '../client';

export interface RateLimitCheck {
  allowed: boolean;
  updatesInLast24h: number;
  limit: number;
  nextAllowedTime?: Date;
}

const DAILY_UPDATE_LIMIT = 3;
const HOURS_IN_DAY = 24;
const MILLISECONDS_IN_24_HOURS = HOURS_IN_DAY * 60 * 60 * 1000;

/**
 * Checks if an RSS update is allowed based on rate limit
 * 
 * @returns RateLimitCheck object with allowed status and metadata
 */
export async function checkUpdateLimit(): Promise<RateLimitCheck> {
  // Calculate 24 hours ago from now (UTC) - using millisecond arithmetic to avoid DST issues
  const twentyFourHoursAgo = new Date(Date.now() - MILLISECONDS_IN_24_HOURS);
  
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
  
  const updatesInLast24h = recentUpdates.length;
  const allowed = updatesInLast24h < DAILY_UPDATE_LIMIT;
  
  // Calculate next allowed time if limit is reached
  let nextAllowedTime: Date | undefined;
  if (!allowed) {
    // The next update is allowed 24 hours after the oldest update in the window
    const oldestUpdate = recentUpdates[0].requestedAt;
    nextAllowedTime = new Date(oldestUpdate.getTime() + MILLISECONDS_IN_24_HOURS);
  }
  
  return {
    allowed,
    updatesInLast24h,
    limit: DAILY_UPDATE_LIMIT,
    nextAllowedTime,
  };
}

/**
 * Gets the count of completed updates in the last 24 hours
 * 
 * @returns Number of successfully completed updates in the rolling 24-hour window
 */
export async function getUpdateCount24h(): Promise<number> {
  const twentyFourHoursAgo = new Date(Date.now() - MILLISECONDS_IN_24_HOURS);
  
  return await prisma.rSSUpdateHistory.count({
    where: {
      requestedAt: {
        gte: twentyFourHoursAgo,
      },
      status: 'completed',
    },
  });
}
