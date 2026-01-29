import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/sources
 * 
 * Fetches all available sources from the database.
 * 
 * Response:
 * {
 *   sources: Array<{
 *     id: string,
 *     name: string,
 *     biasRating: string,
 *     reliability: string
 *   }>,
 *   count: number,
 *   timestamp: string
 * }
 */
export async function GET(_request: NextRequest) {
  try {
    const sources = await prisma.source.findMany({
      select: {
        id: true,
        name: true,
        biasRating: true,
        reliability: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      sources,
      count: sources.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sources:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sources',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
