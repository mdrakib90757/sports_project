/**
 * Standalone Supabase Seeding Script
 * Usage: npm run seed
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  demoTournament,
  demoTeams,
  demoPlayers,
  demoMatches,
  demoLiveMatchEvents,
  demoLiveLineups,
} from '../src/lib/data/demoData';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.log('⚠️  No active Supabase credentials found in environment.');
  console.log('ℹ️  The web application will automatically use the built-in local reactive mock store with multi-tab Realtime simulation.');
  console.log('👉 To seed a remote Supabase database, copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log('🚀 Seeding Bengal Super Cup 2026 data to Supabase...');

  // 1. Tournament
  console.log('1️⃣ Seeding Tournament...');
  const { error: tournError } = await supabase
    .from('tournaments')
    .upsert({
      id: demoTournament.id,
      name: demoTournament.name,
      name_bn: demoTournament.name_bn,
      season: demoTournament.season,
      logo_url: demoTournament.logo_url,
      banner_url: demoTournament.banner_url,
      status: demoTournament.status,
      format: demoTournament.format,
    });
  if (tournError) console.error('Tourn seed error:', tournError.message);

  // 2. Teams
  console.log(`2️⃣ Seeding ${demoTeams.length} Teams...`);
  const { error: teamsError } = await supabase.from('teams').upsert(
    demoTeams.map((t) => ({
      id: t.id,
      name: t.name,
      name_bn: t.name_bn,
      short_name: t.short_name,
      logo_url: t.logo_url,
      primary_color: t.primary_color,
      secondary_color: t.secondary_color,
      group_name: t.group_name,
      city: t.city,
      city_bn: t.city_bn,
      coach: t.coach,
      coach_bn: t.coach_bn,
      stadium: t.stadium,
      stadium_bn: t.stadium_bn,
    }))
  );
  if (teamsError) console.error('Teams seed error:', teamsError.message);

  // 3. Players
  console.log(`3️⃣ Seeding ${demoPlayers.length} Players...`);
  const { error: playersError } = await supabase.from('players').upsert(
    demoPlayers.map((p) => ({
      id: p.id,
      team_id: p.team_id,
      name: p.name,
      name_bn: p.name_bn,
      jersey_number: p.jersey_number,
      position: p.position,
      photo_url: p.photo_url,
      is_captain: p.is_captain ?? false,
      nationality: p.nationality,
      nationality_bn: p.nationality_bn,
      goals_count: p.goals_count,
      assists_count: p.assists_count,
      yellow_cards: p.yellow_cards,
      red_cards: p.red_cards,
      appearances: p.appearances,
    }))
  );
  if (playersError) console.error('Players seed error:', playersError.message);

  // 4. Matches
  console.log(`4️⃣ Seeding ${demoMatches.length} Matches...`);
  const { error: matchesError } = await supabase.from('matches').upsert(
    demoMatches.map((m) => ({
      id: m.id,
      tournament_id: demoTournament.id,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      home_score: m.home_score,
      away_score: m.away_score,
      status: m.status,
      current_minute: m.current_minute,
      minute_offset_seconds: m.minute_offset_seconds,
      is_clock_running: m.is_clock_running,
      match_date: m.match_date,
      venue: m.venue,
      venue_bn: m.venue_bn,
      round: m.round,
      round_bn: m.round_bn,
      stage: m.stage,
      bracket_slot: m.bracket_slot,
      winner_team_id: m.winner_team_id,
    }))
  );
  if (matchesError) console.error('Matches seed error:', matchesError.message);

  // 5. Match Events
  console.log(`5️⃣ Seeding ${demoLiveMatchEvents.length} Live Match Events...`);
  const { error: eventsError } = await supabase.from('match_events').upsert(
    demoLiveMatchEvents.map((e) => ({
      id: e.id,
      match_id: e.match_id,
      team_id: e.team_id,
      player_id: e.player_id,
      assist_player_id: e.assist_player_id,
      event_type: e.event_type,
      minute: e.minute,
      description: e.description,
      created_at: e.created_at,
    }))
  );
  if (eventsError) console.error('Events seed error:', eventsError.message);

  console.log('✅ Seeding completed successfully!');
}

runSeed().catch((err) => {
  console.error('Fatal seeding failure:', err);
  process.exit(1);
});
