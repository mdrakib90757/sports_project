'use client';

import { useQuery } from '@tanstack/react-query';
import { standingsApi } from '../api/standingsApi';

export const standingKeys = {
  all: ['standings'] as const,
};

export function useStandingsQuery() {
  return useQuery({
    queryKey: standingKeys.all,
    queryFn: () => standingsApi.getStandings(),
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: (previousData) => previousData,
  });
}
