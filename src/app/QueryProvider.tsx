'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { realtimeClient } from '@/shared/lib/realtimeClient';
import { Match, MatchEvent } from '@/lib/types';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 20, // 20s
            gcTime: 1000 * 60 * 10, // 10 min
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  // Wire Realtime Event Listeners to patch TanStack Query caches instantly
  useEffect(() => {
    // 1. Live Match Score & Clock updates
    const unbindMatchUpdate = realtimeClient.on('MATCH_UPDATE', (payload: { matchId: string; match: Match }) => {
      if (!payload?.match) return;

      // Update match list cache
      queryClient.setQueriesData<Match[]>({ queryKey: ['matches'] }, (old) => {
        if (!old) return [payload.match];
        return old.map((m) => (m.id === payload.match.id ? { ...m, ...payload.match } : m));
      });

      // Update specific match detail cache
      queryClient.setQueryData<Match>(['match', payload.match.id], (old) => {
        if (!old) return payload.match;
        return { ...old, ...payload.match };
      });

      // Also invalidate standings if full time or status changed
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    });

    // 2. Real-time Match Event Added (Goal, Card, Sub)
    const unbindEventAdd = realtimeClient.on(
      'EVENT_ADD',
      (payload: { event: MatchEvent; match: Match; alert?: any }) => {
        if (payload?.match) {
          queryClient.setQueriesData<Match[]>({ queryKey: ['matches'] }, (old) => {
            if (!old) return [payload.match];
            return old.map((m) => (m.id === payload.match.id ? { ...m, ...payload.match } : m));
          });

          queryClient.setQueryData<Match>(['match', payload.match.id], (old) => {
            if (!old) return payload.match;
            return {
              ...old,
              ...payload.match,
              events: [payload.event, ...(old.events || [])],
            };
          });
        }

        // Invalidate top scorers on goal
        if (payload?.event?.event_type === 'goal' || payload?.event?.event_type === 'penalty_goal') {
          queryClient.invalidateQueries({ queryKey: ['top-scorers'] });
        }
      }
    );

    // 3. Real-time Match Event Deleted
    const unbindEventDelete = realtimeClient.on(
      'EVENT_DELETE',
      (payload: { eventId: string; matchId: string; match?: Match }) => {
        if (payload?.matchId) {
          queryClient.setQueryData<Match>(['match', payload.matchId], (old) => {
            if (!old) return old;
            return {
              ...old,
              events: (old.events || []).filter((e) => e.id !== payload.eventId),
            };
          });
        }
      }
    );

    return () => {
      unbindMatchUpdate();
      unbindEventAdd();
      unbindEventDelete();
    };
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
