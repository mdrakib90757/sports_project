import {
  UserRole,
  PlayerLevel,
  PlayerPosition,
  MatchStatus,
  EventType,
  SquadRole,
  TournamentStatus,
} from '../enums/index.js';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  teamId?: string | null;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  nameBn: string;
  season: string;
  logoUrl: string;
  bannerUrl: string;
  status: TournamentStatus;
  format: string;
  teamsCount: number;
  squadSize: number;
  levelsLocked: boolean;
  squadsLocked: boolean;
}

export interface Team {
  id: string;
  name: string;
  nameBn: string;
  shortName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  groupName: 'Group A' | 'Group B';
  city: string;
  cityBn: string;
  coach: string;
  coachBn?: string;
  stadium: string;
  stadiumBn?: string;
  captainId?: string | null;
  captainPin?: string | null;
}

export interface Player {
  id: string;
  teamId?: string | null;
  name: string;
  nameBn: string;
  phone?: string | null;
  jerseyNumber?: number;
  position: PlayerPosition;
  photoUrl: string;
  isCaptain?: boolean;
  nationality: string;
  nationalityBn?: string;
  level: PlayerLevel;
  extraCategoryTag?: string | null;
  squadRole?: SquadRole;
  goalsCount: number;
  assistsCount: number;
  yellowCards: number;
  redCards: number;
  appearances?: number;
  isRegistered?: boolean;
  createdAt?: string;
}

export interface Official {
  id: string;
  name: string;
  nameBn: string;
  titleEn: string;
  titleBn: string;
  descriptionBn: string;
  photoUrl: string;
  displayOrder: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  assistPlayerId?: string | null;
  eventType: EventType;
  minute: number;
  extraMinute?: number | null;
  description?: string | null;
  subInPlayerId?: string | null;
  createdAt: string;
  player?: Player;
  assistPlayer?: Player;
  team?: Team;
}

export interface MatchLineupItem {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  isStarter: boolean;
  formationPosition?: string;
  gridX?: number;
  gridY?: number;
  player?: Player;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  currentMinute: number;
  minuteOffsetSeconds: number;
  isClockRunning: boolean;
  matchDate: string;
  venue: string;
  venueBn: string;
  round: string;
  roundBn: string;
  stage: 'group' | 'quarter_final' | 'semi_final' | 'final';
  bracketSlot?: number | null;
  winnerTeamId?: string | null;
  homeTeam?: Team;
  awayTeam?: Team;
  events?: MatchEvent[];
  lineups?: MatchLineupItem[];
}

export interface DrawPick {
  id: string;
  sessionId: string;
  roundNumber: number;
  pickIndex: number;
  teamId: string;
  playerId: string;
  level: PlayerLevel;
  pickedAt: string;
  team?: Team;
  player?: Player;
}

export interface DrawSession {
  id: string;
  status: 'idle' | 'officials_intro' | 'active' | 'paused' | 'completed';
  currentLevel: PlayerLevel;
  currentRound: number;
  totalPicks: number;
  isPractice: boolean;
  createdAt: string;
  updatedAt: string;
}
