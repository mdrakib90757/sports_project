import { apiClient } from '@/shared/lib/apiClient';
import { Team, Player, PlayerLevel } from '@/lib/types';
import { demoTeams, demoPlayers } from '@/lib/data/demoData';

export interface DrawSession {
  id: string;
  status: 'idle' | 'active' | 'paused' | 'completed';
  currentLevel: PlayerLevel;
  currentRound: number;
  totalPicks: number;
  isPractice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DrawPick {
  id: string;
  sessionId: string;
  teamId: string;
  playerId: string;
  roundNumber: number;
  pickIndex: number;
  level: PlayerLevel;
  pickedAt: string;
}

export interface DrawStateResponse {
  session: DrawSession;
  teams: (Team & { squad: Player[]; captainPlayer?: Player })[];
  remainingPool: Player[];
  currentTurn?: { team: Team; roundNumber: number; pickIndex: number; level: PlayerLevel };
  picks: DrawPick[];
}

export interface NextPickResult {
  pick: DrawPick;
  session: DrawSession;
  team: Team;
  player: Player;
}

// Resilient local simulation memory fallback
let localPicks: DrawPick[] = [];
let localSession: DrawSession = {
  id: 'session-demo',
  status: 'idle',
  currentLevel: 'A',
  currentRound: 1,
  totalPicks: 0,
  isPractice: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function getLocalState(): DrawStateResponse {
  const assignedPlayerIds = new Set(localPicks.map((p) => p.playerId));
  const remaining = demoPlayers.filter(
    (p) => !assignedPlayerIds.has(p.id) && !demoTeams.some((t) => (t as any).captain_id === p.id)
  );

  const levelPlayers = remaining.filter((p) => (p.level || 'A') === localSession.currentLevel);
  const nextTeam = demoTeams[localPicks.length % demoTeams.length];

  const teamsWithSquad = demoTeams.map((t) => {
    const squad = demoPlayers.filter((p) => {
      const isAssigned = localPicks.some((pick) => pick.teamId === t.id && pick.playerId === p.id);
      return isAssigned || p.team_id === t.id;
    });
    const captain = squad.find((p) => p.is_captain);
    return {
      ...t,
      squad,
      captainPlayer: captain,
    };
  });

  return {
    session: localSession,
    teams: teamsWithSquad,
    remainingPool: levelPlayers.length > 0 ? levelPlayers : remaining,
    currentTurn:
      localSession.status === 'active' && remaining.length > 0
        ? {
            team: nextTeam,
            roundNumber: localSession.currentRound,
            pickIndex: localPicks.length,
            level: localSession.currentLevel,
          }
        : undefined,
    picks: localPicks,
  };
}

export const drawApi = {
  getSessionState: async (): Promise<DrawStateResponse> => {
    try {
      return await apiClient<DrawStateResponse>('draw/session');
    } catch {
      return getLocalState();
    }
  },

  startSession: async (isPractice = false): Promise<DrawSession> => {
    try {
      return await apiClient<DrawSession>('draw/start', {
        method: 'POST',
        body: JSON.stringify({ isPractice }),
      });
    } catch {
      localSession = {
        ...localSession,
        status: 'active',
        isPractice,
        updatedAt: new Date().toISOString(),
      };
      return localSession;
    }
  },

  nextPick: async (): Promise<NextPickResult> => {
    try {
      return await apiClient<NextPickResult>('draw/next-pick', {
        method: 'POST',
      });
    } catch {
      const state = getLocalState();
      if (!state.currentTurn || state.remainingPool.length === 0) {
        localSession.status = 'completed';
        throw new Error('All players have been successfully drawn!');
      }

      const player = state.remainingPool[Math.floor(Math.random() * state.remainingPool.length)];
      const pick: DrawPick = {
        id: `pick-${Date.now()}`,
        sessionId: localSession.id,
        teamId: state.currentTurn.team.id,
        playerId: player.id,
        roundNumber: state.currentTurn.roundNumber,
        pickIndex: state.picks.length,
        level: state.currentTurn.level,
        pickedAt: new Date().toISOString(),
      };

      localPicks.push(pick);
      localSession.totalPicks = localPicks.length;
      return {
        pick,
        session: localSession,
        team: state.currentTurn.team,
        player,
      };
    }
  },

  undoLastPick: async (): Promise<{ undonePick: DrawPick | null }> => {
    try {
      return await apiClient<{ undonePick: DrawPick | null }>('draw/undo', {
        method: 'POST',
      });
    } catch {
      const undone = localPicks.pop() || null;
      localSession.totalPicks = localPicks.length;
      return { undonePick: undone };
    }
  },

  resetSession: async (): Promise<void> => {
    try {
      await apiClient<void>('draw/reset', {
        method: 'POST',
      });
    } catch {
      localPicks = [];
      localSession = {
        ...localSession,
        status: 'idle',
        totalPicks: 0,
        currentRound: 1,
        currentLevel: 'A',
      };
    }
  },
};
