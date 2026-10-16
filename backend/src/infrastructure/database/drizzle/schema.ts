import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  season: text('season').notNull(),
  logoUrl: text('logo_url').notNull(),
  bannerUrl: text('banner_url').notNull(),
  status: text('status').notNull().default('ongoing'),
  format: text('format').notNull().default('8 Teams Knockout & Group'),
  teamsCount: integer('teams_count').notNull().default(8),
  squadSize: integer('squad_size').notNull().default(8),
  levelsLocked: boolean('levels_locked').notNull().default(false),
  squadsLocked: boolean('squads_locked').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  shortName: text('short_name').notNull(),
  logoUrl: text('logo_url').notNull(),
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color').notNull(),
  groupName: text('group_name').notNull(),
  city: text('city').notNull(),
  cityBn: text('city_bn').notNull(),
  coach: text('coach').notNull(),
  coachBn: text('coach_bn'),
  stadium: text('stadium').notNull(),
  stadiumBn: text('stadium_bn'),
  captainId: text('captain_id'),
  captainPin: text('captain_pin'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  teamId: text('team_id'),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  phone: text('phone'),
  jerseyNumber: integer('jersey_number'),
  position: text('position').notNull(),
  photoUrl: text('photo_url').notNull(),
  isCaptain: boolean('is_captain').default(false),
  nationality: text('nationality').notNull().default('Bangladesh'),
  nationalityBn: text('nationality_bn').default('বাংলাদেশ'),
  level: text('level').notNull().default('B'),
  extraCategoryTag: text('extra_category_tag'),
  squadRole: text('squad_role').default('MAIN'),
  goalsCount: integer('goals_count').notNull().default(0),
  assistsCount: integer('assists_count').notNull().default(0),
  yellowCards: integer('yellow_cards').notNull().default(0),
  redCards: integer('red_cards').notNull().default(0),
  appearances: integer('appearances').default(0),
  isRegistered: boolean('is_registered').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const officials = pgTable('officials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  titleEn: text('title_en').notNull(),
  titleBn: text('title_bn').notNull(),
  descriptionBn: text('description_bn').notNull(),
  photoUrl: text('photo_url').notNull(),
  displayOrder: integer('display_order').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  tournamentId: text('tournament_id').notNull(),
  homeTeamId: text('home_team_id').notNull(),
  awayTeamId: text('away_team_id').notNull(),
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  status: text('status').notNull().default('upcoming'),
  currentMinute: integer('current_minute').notNull().default(0),
  minuteOffsetSeconds: integer('minute_offset_seconds').notNull().default(0),
  isClockRunning: boolean('is_clock_running').notNull().default(false),
  matchDate: text('match_date').notNull(),
  venue: text('venue').notNull(),
  venueBn: text('venue_bn').notNull(),
  round: text('round').notNull(),
  roundBn: text('round_bn').notNull(),
  stage: text('stage').notNull().default('group'),
  bracketSlot: integer('bracket_slot'),
  winnerTeamId: text('winner_team_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const matchEvents = pgTable('match_events', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull(),
  teamId: text('team_id').notNull(),
  playerId: text('player_id').notNull(),
  assistPlayerId: text('assist_player_id'),
  eventType: text('event_type').notNull(),
  minute: integer('minute').notNull(),
  extraMinute: integer('extra_minute'),
  description: text('description'),
  subInPlayerId: text('sub_in_player_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matchLineups = pgTable('match_lineups', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull(),
  teamId: text('team_id').notNull(),
  playerId: text('player_id').notNull(),
  isStarter: boolean('is_starter').notNull().default(true),
  formationPosition: text('formation_position'),
  gridX: integer('grid_x').default(50),
  gridY: integer('grid_y').default(50),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('PUBLIC'),
  teamId: text('team_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const drawSessions = pgTable('draw_sessions', {
  id: text('id').primaryKey(),
  status: text('status').notNull().default('idle'),
  currentLevel: text('current_level').notNull().default('A'),
  currentRound: integer('current_round').notNull().default(1),
  totalPicks: integer('total_picks').notNull().default(0),
  isPractice: boolean('is_practice').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const drawPicks = pgTable('draw_picks', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  roundNumber: integer('round_number').notNull(),
  pickIndex: integer('pick_index').notNull(),
  teamId: text('team_id').notNull(),
  playerId: text('player_id').notNull(),
  level: text('level').notNull(),
  pickedAt: timestamp('picked_at').defaultNow(),
});
