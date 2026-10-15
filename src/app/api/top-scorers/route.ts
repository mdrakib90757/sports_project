import { NextResponse } from 'next/server';
import { demoPlayers, demoTeams, demoLiveMatchEvents } from '@/lib/data/demoData';
import { computeTopScorers } from '@/lib/data/statsUtils';

export async function GET() {
  try {
    const leaderboard = computeTopScorers(demoPlayers, demoTeams, demoLiveMatchEvents);

    return NextResponse.json({
      success: true,
      count: leaderboard.length,
      timestamp: new Date().toISOString(),
      data: leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compute top scorers' },
      { status: 500 }
    );
  }
}
