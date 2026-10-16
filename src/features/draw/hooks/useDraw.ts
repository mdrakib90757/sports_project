'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { drawApi, DrawStateResponse, NextPickResult } from '../api/drawApi';
import { sfx } from '../utils/soundEffects';
import { realtimeClient } from '@/shared/lib/realtimeClient';
import { Player, Team } from '@/lib/types';

export function useDraw() {
  const queryClient = useQueryClient();
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedPlayer, setRevealedPlayer] = useState<Player | null>(null);
  const [revealedTeam, setRevealedTeam] = useState<Team | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data, isLoading, refetch } = useQuery<DrawStateResponse>({
    queryKey: ['draw-session'],
    queryFn: () => drawApi.getSessionState(),
    staleTime: 5000,
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sfx.enabled = next;
      return next;
    });
  }, []);

  // Listen to realtime socket/SSE broadcasts
  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['draw-session'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    };

    const unsub1 = realtimeClient.on('DRAW_PICK', invalidate);
    const unsub2 = realtimeClient.on('DRAW_STATE', invalidate);
    const unsub3 = realtimeClient.on('DRAW_UNDO', invalidate);
    const unsub4 = realtimeClient.on('DRAW_RESET', invalidate);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [queryClient]);

  const triggerRevealAnimation = useCallback(
    (player: Player, team: Team) => {
      setIsDrawing(true);
      setRevealedPlayer(null);
      setRevealedTeam(team);

      // 1. Play drumroll
      sfx.playDrumroll(1800);

      // 2. Suspense delay then flip reveal
      setTimeout(() => {
        setRevealedPlayer(player);
        sfx.playFanfare();

        // 3. Confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#C6FF3D', '#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
          });
        } catch {
          // Ignore if canvas unavailable
        }

        // 4. End drawing phase
        setTimeout(() => {
          setIsDrawing(false);
        }, 1200);
      }, 1800);
    },
    []
  );

  const startMutation = useMutation({
    mutationFn: (isPractice: boolean) => drawApi.startSession(isPractice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw-session'] });
      sfx.playPop();
    },
  });

  const pickMutation = useMutation({
    mutationFn: () => drawApi.nextPick(),
    onSuccess: (result: NextPickResult) => {
      triggerRevealAnimation(result.player, result.team);
      queryClient.invalidateQueries({ queryKey: ['draw-session'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: () => drawApi.undoLastPick(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw-session'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setRevealedPlayer(null);
      sfx.playPop();
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => drawApi.resetSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw-session'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setRevealedPlayer(null);
      setRevealedTeam(null);
      sfx.playPop();
    },
  });

  return {
    state: data,
    isLoading,
    isDrawing,
    revealedPlayer,
    revealedTeam,
    soundEnabled,
    toggleSound,
    startSession: (isPractice = false) => startMutation.mutate(isPractice),
    isStarting: startMutation.isPending,
    nextPick: () => pickMutation.mutate(),
    isPicking: pickMutation.isPending || isDrawing,
    undoLastPick: () => undoMutation.mutate(),
    isUndoing: undoMutation.isPending,
    resetSession: () => resetMutation.mutate(),
    isResetting: resetMutation.isPending,
    refetch,
  };
}
