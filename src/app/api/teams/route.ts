import { NextResponse } from 'next/server';
import { demoTeams, demoPlayers } from '@/lib/data/demoData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('teams').select(`
        *,
        players:players(id, name, jersey_number, position)
      `);
      if (!error && data) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    }

    const data = demoTeams.map((team) => {
      const teamPlayers = demoPlayers.filter((p) => p.team_id === team.id);
      return {
        ...team,
        player_count: teamPlayers.length,
      };
    });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
