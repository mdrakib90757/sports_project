'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '../api/matchesApi';
import { Match, MatchStatus, EventType } from '@/lib/types';

export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (status?: string, teamId?: string) => [...matchKeys.lists(), { status, teamId }] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
};

export function useMatchesQuery(status?: string, teamId?: string) {
  return useQuery({
    queryKey: matchKeys.list(status, teamId),
    queryFn: () => matchesApi.getMatches(status, teamId),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 15,
  });
}

export function useMatchDetailQuery(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchesApi.getMatchById(id),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 10,
    enabled: Boolean(id),
  });
}

export function useUpdateScoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      matchId: string;
      homeScore: number;
      awayScore: number;
      status: MatchStatus;
      currentMinute: number;
      isClockRunning: boolean;
    }) => matchesApi.updateScore(payload),
    // Optimistic Update
    onMutate: async (newScore) => {
      await queryClient.cancelQueries({ queryKey: matchKeys.all });

      const prevDetail = queryClient.getQueryData<Match>(matchKeys.detail(newScore.matchId));
      if (prevDetail) {
        queryClient.setQueryData<Match>(matchKeys.detail(newScore.matchId), {
          ...prevDetail,
          home_score: newScore.homeScore,
          away_score: newScore.awayScore,
          status: newScore.status,
          current_minute: newScore.currentMinute,
          is_clock_running: newScore.isClockRunning,
        });
      }

      return { prevDetail };
    },
    onError: (_err, newScore, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(matchKeys.detail(newScore.matchId), context.prevDetail);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}

export function useRecordEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      matchId: string;
      teamId: string;
      playerId: string;
      assistPlayerId?: string | null;
      eventType: EventType;
      minute: number;
      description?: string | null;
    }) => matchesApi.recordEvent(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['top-scorers'] });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, eventId }: { matchId: string; eventId: string }) =>
      matchesApi.deleteEvent(matchId, eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}
