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
