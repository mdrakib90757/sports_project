import { apiClient } from '@/shared/lib/apiClient';
import { Player, TopScorerRow, PlayerPosition, PlayerLevel, SquadRole } from '@/lib/types';
import { demoPlayers, demoTeams, demoLiveMatchEvents } from '@/lib/data/demoData';
import { computeTopScorers } from '@/lib/data/statsUtils';

export const playersApi = {
  getPlayers: async (teamId?: string, level?: PlayerLevel): Promise<Player[]> => {
    try {
      return await apiClient<Player[]>('players', {
        params: { teamId, level },
      });
    } catch {
      let list = demoPlayers;
      if (teamId && teamId !== 'all') {
        list = list.filter((p) => p.team_id === teamId);
      }
      return list;
    }
  },

  getTopScorers: async (): Promise<TopScorerRow[]> => {
    try {
      return await apiClient<TopScorerRow[]>('top-scorers');
    } catch {
      return computeTopScorers(demoPlayers, demoTeams, demoLiveMatchEvents);
    }
  },

  registerPlayer: async (data: {
    name: string;
    nameBn?: string;
    phone: string;
    position: PlayerPosition;
    photoUrl?: string;
  }): Promise<Player> => {
    return apiClient<Player>('players/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  assignLevel: async (playerId: string, level: PlayerLevel, extraCategoryTag?: string | null): Promise<Player> => {
    return apiClient<Player>(`players/${playerId}/level`, {
      method: 'PATCH',
      body: JSON.stringify({ level, extraCategoryTag }),
    });
  },

  setSquadRole: async (playerId: string, squadRole: SquadRole): Promise<Player> => {
    return apiClient<Player>(`players/${playerId}/squad-role`, {
      method: 'PATCH',
      body: JSON.stringify({ squadRole }),
    });
  },
};
