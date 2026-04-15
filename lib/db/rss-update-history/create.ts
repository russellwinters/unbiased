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
