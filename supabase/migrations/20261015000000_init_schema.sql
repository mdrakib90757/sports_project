-- ==============================================================================
-- BENGAL SUPER CUP 2026 - SUPABASE DATABASE INITIAL SCHEMA & RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    season TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    format TEXT NOT NULL DEFAULT 'Group Stage + Knockout',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    short_name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#10b981',
    secondary_color TEXT NOT NULL DEFAULT '#064e3b',
    group_name TEXT NOT NULL CHECK (group_name IN ('Group A', 'Group B')),
    city TEXT NOT NULL,
    city_bn TEXT,
    coach TEXT,
    coach_bn TEXT,
    stadium TEXT,
    stadium_bn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    jersey_number INTEGER NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
    photo_url TEXT,
    is_captain BOOLEAN DEFAULT FALSE,
    nationality TEXT DEFAULT 'Bangladesh',
    nationality_bn TEXT DEFAULT 'বাংলাদেশ',
    goals_count INTEGER DEFAULT 0,
    assists_count INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    appearances INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (
        status IN ('upcoming', 'live_first_half', 'half_time', 'live_second_half', 'extra_time', 'penalties', 'full_time', 'postponed')
    ),
    current_minute INTEGER DEFAULT 0,
    minute_offset_seconds INTEGER DEFAULT 0,
    is_clock_running BOOLEAN DEFAULT FALSE,
    match_date TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    venue_bn TEXT,
    round TEXT NOT NULL,
    round_bn TEXT,
    stage TEXT NOT NULL DEFAULT 'group' CHECK (stage IN ('group', 'quarter_final', 'semi_final', 'final')),
    bracket_slot INTEGER,
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MATCH EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    assist_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (
        event_type IN ('goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'var_decision')
    ),
    minute INTEGER NOT NULL,
    extra_minute INTEGER,
    description TEXT,
    sub_in_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATCH LINEUPS TABLE
CREATE TABLE IF NOT EXISTS public.match_lineups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    is_starter BOOLEAN DEFAULT TRUE,
    formation_position TEXT,
    grid_x INTEGER,
    grid_y INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Rule: Public can ONLY READ; Authenticated admins can WRITE
-- ==============================================================================

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;

-- 1. Tournaments Policies
CREATE POLICY "Public read tournaments" 
ON public.tournaments FOR SELECT 
USING (true);

CREATE POLICY "Admin manage tournaments" 
ON public.tournaments FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Teams Policies
CREATE POLICY "Public read teams" 
ON public.teams FOR SELECT 
USING (true);

CREATE POLICY "Admin manage teams" 
ON public.teams FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Players Policies
CREATE POLICY "Public read players" 
ON public.players FOR SELECT 
USING (true);

CREATE POLICY "Admin manage players" 
ON public.players FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Matches Policies
CREATE POLICY "Public read matches" 
ON public.matches FOR SELECT 
USING (true);

CREATE POLICY "Admin manage matches" 
ON public.matches FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Match Events Policies
CREATE POLICY "Public read match_events" 
ON public.match_events FOR SELECT 
USING (true);

CREATE POLICY "Admin manage match_events" 
ON public.match_events FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. Match Lineups Policies
CREATE POLICY "Public read match_lineups" 
ON public.match_lineups FOR SELECT 
USING (true);

CREATE POLICY "Admin manage match_lineups" 
ON public.match_lineups FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET FOR TEAM LOGOS & PLAYER PHOTOS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-media', 'tournament-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read tournament media"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament-media');

CREATE POLICY "Admin upload tournament media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tournament-media');

CREATE POLICY "Admin update tournament media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tournament-media');

CREATE POLICY "Admin delete tournament media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tournament-media');
