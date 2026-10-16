'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playersApi } from '../api/playersApi';
import { PlayerLevel, PlayerPosition, SquadRole } from '@/lib/types';

export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (teamId?: string, level?: PlayerLevel) => [...playerKeys.lists(), { teamId, level }] as const,
  topScorers: () => [...playerKeys.all, 'top-scorers'] as const,
};

export function usePlayersQuery(teamId?: string, level?: PlayerLevel) {
  return useQuery({
    queryKey: playerKeys.list(teamId, level),
    queryFn: () => playersApi.getPlayers(teamId, level),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

export function useTopScorersQuery() {
  return useQuery({
    queryKey: playerKeys.topScorers(),
    queryFn: () => playersApi.getTopScorers(),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function useRegisterPlayerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      nameBn?: string;
      phone: string;
      position: PlayerPosition;
      photoUrl?: string;
    }) => playersApi.registerPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}

export function useAssignLevelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playerId,
      level,
      extraCategoryTag,
    }: {
      playerId: string;
      level: PlayerLevel;
      extraCategoryTag?: string | null;
    }) => playersApi.assignLevel(playerId, level, extraCategoryTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}

export function useSetSquadRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, squadRole }: { playerId: string; squadRole: SquadRole }) =>
      playersApi.setSquadRole(playerId, squadRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}
