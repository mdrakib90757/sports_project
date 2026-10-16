import { apiClient } from '@/shared/lib/apiClient';
import { Team, Player } from '@/lib/types';
import { demoTeams, demoPlayers } from '@/lib/data/demoData';

export const teamsApi = {
  getTeams: async (): Promise<Team[]> => {
    try {
      return await apiClient<Team[]>('teams');
    } catch {
      return demoTeams;
    }
  },

  getTeamById: async (id: string): Promise<Team & { squad: Player[] }> => {
    try {
      return await apiClient<Team & { squad: Player[] }>(`teams/${id}`);
    } catch {
      const team = demoTeams.find((t) => t.id === id);
      if (!team) throw new Error(`Team ${id} not found`);
      const squad = demoPlayers.filter((p) => p.team_id === id);
      return {
        ...team,
        squad,
      };
    }
  },
};
