export type UserRole = 'ADMIN' | 'OPERATOR' | 'CAPTAIN' | 'PUBLIC';

export type PlayerLevel = 'A' | 'B' | 'C' | 'EXTRA';

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

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

export type SquadRole = 'MAIN' | 'EXTRA';

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
