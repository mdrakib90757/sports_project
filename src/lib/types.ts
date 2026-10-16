export type MatchStatus =
  | 'upcoming'
  | 'live_first_half'
  | 'half_time'
  | 'live_second_half'
  | 'extra_time'
  | 'penalties'
  | 'full_time'
  | 'postponed';

export type EventType =
  | 'goal'
  | 'penalty_goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'var_decision';

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type PlayerLevel = 'A' | 'B' | 'C' | 'EXTRA';
export type SquadRole = 'MAIN' | 'EXTRA';

export interface Tournament {
  id: string;
  name: string;
  name_bn: string;
  season: string;
  logo_url: string;
  banner_url: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  format: string;
}

export interface Team {
  id: string;
  name: string;
  name_bn: string;
  short_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  group_name: 'Group A' | 'Group B';
  city: string;
  city_bn: string;
  coach: string;
  coach_bn?: string;
  stadium: string;
  stadium_bn?: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  name_bn: string;
  jersey_number: number;
  position: PlayerPosition;
  photo_url: string;
  phone?: string;
  is_captain?: boolean;
  nationality: string;
  nationality_bn?: string;
  goals_count: number;
  assists_count: number;
  yellow_cards: number;
  red_cards: number;
  appearances?: number;
  level?: PlayerLevel;
  extra_category_tag?: string | null;
  squad_role?: SquadRole;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string;
  assist_player_id?: string | null;
  event_type: EventType;
  minute: number;
  extra_minute?: number | null;
  description?: string | null;
  sub_in_player_id?: string | null;
  created_at: string;
  // joined info
  player?: Player;
  assist_player?: Player;
  sub_in_player?: Player;
  team?: Team;
}

export interface MatchLineupItem {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string;
  is_starter: boolean;
  formation_position?: string;
  grid_x?: number; // 0 to 100 on pitch
  grid_y?: number; // 0 to 100 on pitch
  player?: Player;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: MatchStatus;
  current_minute: number;
  minute_offset_seconds: number;
  is_clock_running: boolean;
  match_date: string;
  venue: string;
  venue_bn: string;
  round: string;
  round_bn: string;
  stage: 'group' | 'quarter_final' | 'semi_final' | 'final';
  bracket_slot?: number | null;
  winner_team_id?: string | null;
  home_team?: Team;
  away_team?: Team;
  events?: MatchEvent[];
  lineups?: MatchLineupItem[];
}

export interface StandingsRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface TopScorerRow {
  rank: number;
  player: Player;
  team: Team;
  goals: number;
  assists: number;
  penalties: number;
  matches: number;
}

export type DignitaryCategory = 'league' | 'tournament' | 'team' | 'committee';

export interface Dignitary {
  id: string;
  category: DignitaryCategory;
  name: string;
  name_bn: string;
  role: string;
  role_bn: string;
  badge: string;
  badge_bn: string;
  photo_url: string;
  team_id?: string;
  team_name?: string;
  team_name_bn?: string;
  team_logo_url?: string;
  team_color?: string;
  speech_bn: string;
  speech_en: string;
  message_bn: string;
  message_en: string;
  highlights_bn: string[];
  highlights_en: string[];
}
