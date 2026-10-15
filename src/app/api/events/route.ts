import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { EventType, MatchEvent } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      match_id,
      team_id,
      player_id,
      assist_player_id,
      event_type,
      minute,
      description,
    } = body;

    if (!match_id || !team_id || !player_id || !event_type || minute === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required match event fields' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('match_events')
        .insert({
          match_id,
          team_id,
          player_id,
          assist_player_id: assist_player_id || null,
          event_type: event_type as EventType,
          minute: Number(minute),
          description: description || null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Event created and broadcasted',
        data,
      });
    }

    // Mock response
    const mockEvent: MatchEvent = {
      id: `evt-${Date.now()}`,
      match_id,
      team_id,
      player_id,
      assist_player_id: assist_player_id || null,
      event_type: event_type as EventType,
      minute: Number(minute),
      description: description || null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: mockEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event id is required' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('match_events').delete().eq('id', eventId);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event ${eventId} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
