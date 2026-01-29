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
