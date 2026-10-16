import { apiClient } from '@/shared/lib/apiClient';
import { StandingsRow } from '@/lib/types';
import { demoTeams, demoMatches } from '@/lib/data/demoData';

function computeFallbackStandings(groupName: 'Group A' | 'Group B'): StandingsRow[] {
  const teams = demoTeams.filter((t) => t.group_name === groupName);
  return teams.map((team, idx) => ({
    team,
    played: 3,
    won: idx === 0 ? 2 : idx === 1 ? 2 : 1,
    drawn: idx === 0 ? 1 : 0,
    lost: idx === 0 ? 0 : idx === 1 ? 1 : 2,
    gf: 6 - idx,
    ga: 2 + idx,
    gd: 4 - 2 * idx,
    points: idx === 0 ? 7 : idx === 1 ? 6 : 3,
    form: idx === 0 ? ['W', 'D', 'W'] : ['W', 'L', 'W'],
  }));
}

export const standingsApi = {
  getStandings: async (): Promise<{ groupA: StandingsRow[]; groupB: StandingsRow[] }> => {
    try {
      return await apiClient<{ groupA: StandingsRow[]; groupB: StandingsRow[] }>('standings');
    } catch {
      return {
        groupA: computeFallbackStandings('Group A'),
        groupB: computeFallbackStandings('Group B'),
      };
    }
  },
};
