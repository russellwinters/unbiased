import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/sources
 * 
 * Returns all available news sources with their metadata.
 * This endpoint is used by the filter UI to display source options.
 * 
 * Response:
 * {
 *   sources: Array<{
 *     id: string;           // UUID
 *     name: string;         // Display name (e.g., "The Guardian")
 *     biasRating: string;   // "left", "lean-left", "center", "lean-right", "right"
 *     domain: string;       // Source domain
 *   }>,
 *   count: number,
 *   timestamp: string
 * }
 */
export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      select: {
        id: true,
        name: true,
        biasRating: true,
        domain: true,
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
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sources',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
