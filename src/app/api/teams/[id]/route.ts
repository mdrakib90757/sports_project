import { NextRequest, NextResponse } from 'next/server';
import { demoTeams, demoPlayers, demoMatches } from '@/lib/data/demoData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured() && supabase) {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (!teamError && team) {
        const { data: squad } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', id)
          .order('jersey_number', { ascending: true });

        const { data: fixtures } = await supabase
          .from('matches')
          .select('*')
          .or(`home_team_id.eq.${id},away_team_id.eq.${id}`);

        return NextResponse.json({
          success: true,
          data: {
            ...team,
            squad: squad || [],
            matches: fixtures || [],
          },
        });
      }
    }

    const team = demoTeams.find((t) => t.id === id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    const squad = demoPlayers
      .filter((p) => p.team_id === id)
      .sort((a, b) => a.jersey_number - b.jersey_number);

    const fixtures = demoMatches.filter(
      (m) => m.home_team_id === id || m.away_team_id === id
    );

    return NextResponse.json({
      success: true,
      data: {
        ...team,
        squad,
        matches: fixtures,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch team details' },
      { status: 500 }
    );
  }
}
