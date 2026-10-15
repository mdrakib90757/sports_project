import { NextRequest, NextResponse } from 'next/server';
import { demoMatches, demoTeams, demoPlayers, demoLiveMatchEvents, demoLiveLineups, getHydratedMatches } from '@/lib/data/demoData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MatchStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const teamId = searchParams.get('teamId');

    // If Supabase is connected, fetch from DB
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('matches').select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        events:match_events(*)
      `);

      if (status) {
        query = query.eq('status', status);
      }
      if (teamId) {
        query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    }

    // Fallback to hydrated demo data
    let matches = getHydratedMatches(
      demoMatches,
      demoTeams,
      demoPlayers,
      demoLiveMatchEvents,
      demoLiveLineups
    );

    if (status) {
      if (status === 'live') {
        matches = matches.filter((m) => m.status.startsWith('live') || m.status === 'half_time');
      } else {
        matches = matches.filter((m) => m.status === status);
      }
    }

    if (teamId && teamId !== 'all') {
      matches = matches.filter((m) => m.home_team_id === teamId || m.away_team_id === teamId);
    }

    return NextResponse.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore, status, currentMinute, isClockRunning } = body;

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'matchId is required' },
        { status: 400 }
      );
    }

    // If Supabase is configured, update database
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: status as MatchStatus,
          current_minute: currentMinute,
          is_clock_running: isClockRunning,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Match updated successfully', data });
    }

    // Return updated payload representation
    return NextResponse.json({
      success: true,
      message: 'Match state broadcasted successfully',
      data: {
        matchId,
        homeScore,
        awayScore,
        status,
        currentMinute,
        isClockRunning,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update match' },
      { status: 500 }
    );
  }
}
