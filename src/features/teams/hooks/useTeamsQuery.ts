'use client';

import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '../api/teamsApi';

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

export function useTeamsQuery() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => teamsApi.getTeams(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamDetailQuery(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsApi.getTeamById(id),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    enabled: Boolean(id),
  });
}
