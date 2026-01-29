import { prisma } from '../client';

export interface RateLimitCheck {
  isAllowed: boolean;
  updatesInPreviousPeriod: number;
  updateLimit: number;
  allowUpdateNext?: Date;
}

const PERIOD_UPDATE_LIMIT = 3;
const HOURS_IN_PERIOD = 24;
const MILLISECONDS_IN_PERIOD = HOURS_IN_PERIOD * 60 * 60 * 1000;

/**
 * Checks if an RSS update is allowed based on rate limit
 * 
 * @returns RateLimitCheck object with allowed status and metadata
 */
export async function checkUpdateLimit(): Promise<RateLimitCheck> {
  const periodAgo = new Date(Date.now() - MILLISECONDS_IN_PERIOD);

  const recentUpdates = await prisma.rSSUpdateHistory.findMany({
    where: {
      requestedAt: {
        gte: periodAgo,
      },
      status: 'completed',
    },
    orderBy: {
      requestedAt: 'asc',
    },
    select: {
      requestedAt: true,
    },
  });

  const updatesInPreviousPeriod = recentUpdates.length;
  const isAllowed = updatesInPreviousPeriod < PERIOD_UPDATE_LIMIT;

  let allowUpdateNext: Date | undefined = getNextAllowedTime(recentUpdates.map(update => update.requestedAt));

  return {
    isAllowed,
    updatesInPreviousPeriod,
    updateLimit: PERIOD_UPDATE_LIMIT,
    allowUpdateNext,
  };
}

/**
 * Gets the count of completed updates in the last 24 hours
 * 
 * @returns Number of successfully completed updates in the rolling 24-hour window
 */
export async function getUpdateCount24h(): Promise<number> {
  const periodAgo = new Date(Date.now() - MILLISECONDS_IN_PERIOD);

  return await prisma.rSSUpdateHistory.count({
    where: {
      requestedAt: {
        gte: periodAgo,
      },
      status: 'completed',
    },
  });
}


function getNextAllowedTime(recentUpdates: Date[]): Date | undefined {
  const hasExceededPeriodLimit = recentUpdates.length >= PERIOD_UPDATE_LIMIT;
  const oldestUpdate = recentUpdates[0];
  return hasExceededPeriodLimit
    ? addPeriodHours(oldestUpdate)
    : undefined;
}

function addPeriodHours(date: Date): Date {
  return new Date(date.getTime() + MILLISECONDS_IN_PERIOD);
}