import { NextResponse } from 'next/server';
import { demoTeams, demoMatches } from '@/lib/data/demoData';
import { computeStandings } from '@/lib/data/statsUtils';

export async function GET() {
  try {
    const standings = computeStandings(demoTeams, demoMatches);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: standings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compute standings' },
      { status: 500 }
    );
  }
}
