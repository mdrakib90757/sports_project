import { apiClient } from '@/shared/lib/apiClient';
import { Match, MatchEvent, MatchStatus, EventType } from '@/lib/types';
import { demoMatches, demoTeams, demoPlayers, demoLiveMatchEvents, demoLiveLineups, getHydratedMatches } from '@/lib/data/demoData';

export const matchesApi = {
  getMatches: async (status?: string, teamId?: string): Promise<Match[]> => {
    try {
      return await apiClient<Match[]>('matches', {
        params: { status, teamId },
      });
    } catch {
      // Resilient fallback to hydrated demo data
      let list = getHydratedMatches(demoMatches, demoTeams, demoPlayers, demoLiveMatchEvents, demoLiveLineups);
      if (status) {
        if (status === 'live') {
          list = list.filter((m) => m.status.startsWith('live') || m.status === 'half_time');
        } else {
          list = list.filter((m) => m.status === status);
        }
      }
      if (teamId && teamId !== 'all') {
        list = list.filter((m) => m.home_team_id === teamId || m.away_team_id === teamId);
      }
      return list;
    }
  },

  getMatchById: async (id: string): Promise<Match> => {
    try {
      return await apiClient<Match>(`matches/${id}`);
    } catch {
      const list = getHydratedMatches(demoMatches, demoTeams, demoPlayers, demoLiveMatchEvents, demoLiveLineups);
      const match = list.find((m) => m.id === id);
      if (!match) throw new Error(`Match ${id} not found`);
      return match;
    }
  },

  updateScore: async (payload: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: MatchStatus;
    currentMinute: number;
    isClockRunning: boolean;
  }): Promise<Match> => {
    return apiClient<Match>(`matches/${payload.matchId}/score`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  recordEvent: async (payload: {
    matchId: string;
    teamId: string;
    playerId: string;
    assistPlayerId?: string | null;
    eventType: EventType;
    minute: number;
    description?: string | null;
  }): Promise<{ event: MatchEvent; match: Match; alert?: any }> => {
    return apiClient<{ event: MatchEvent; match: Match; alert?: any }>(`matches/${payload.matchId}/events`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteEvent: async (matchId: string, eventId: string): Promise<void> => {
    return apiClient<void>(`matches/${matchId}/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};
