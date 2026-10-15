import { NextRequest, NextResponse } from 'next/server';
import { demoMatches, demoTeams, demoPlayers, demoLiveMatchEvents, demoLiveLineups, getHydratedMatches } from '@/lib/data/demoData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Supabase DB fetch
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          events:match_events(*),
          lineups:match_lineups(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    // Fallback to hydrated demo matches
    const allMatches = getHydratedMatches(
      demoMatches,
      demoTeams,
      demoPlayers,
      demoLiveMatchEvents,
      demoLiveLineups
    );

    const match = allMatches.find((m) => m.id === id);

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch match' },
      { status: 500 }
    );
  }
}
