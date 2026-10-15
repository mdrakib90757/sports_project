'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Match,
  Team,
  Player,
  MatchEvent,
  MatchLineupItem,
  Tournament,
  MatchStatus,
  EventType,
} from '../types';
import {
  demoTournament,
  demoTeams,
  demoPlayers,
  demoMatches,
  demoLiveMatchEvents,
  demoLiveLineups,
  getHydratedMatches,
} from './demoData';
import { supabase, isSupabaseConfigured } from '../supabase/client';

interface GoalAlert {
  id: string;
  matchId: string;
  team: Team;
  player: Player;
  minute: number;
  homeScore: number;
  awayScore: number;
}

interface TournamentStoreType {
  tournament: Tournament;
  teams: Team[];
  players: Player[];
  matches: Match[];
  events: MatchEvent[];
  lineups: MatchLineupItem[];
  isRealtimeConnected: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  activeGoalAlert: GoalAlert | null;
  dismissGoalAlert: () => void;
  updateMatchScore: (
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: MatchStatus,
    currentMinute: number,
    isClockRunning: boolean
  ) => Promise<void>;
  addMatchEvent: (eventData: {
    match_id: string;
    team_id: string;
    player_id: string;
    assist_player_id?: string | null;
    event_type: EventType;
    minute: number;
    description?: string | null;
  }) => Promise<void>;
  deleteMatchEvent: (eventId: string) => Promise<void>;
  loginDemoAdmin: () => void;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error?: string }>;
  logoutAdmin: () => void;
  getMatchById: (id: string) => Match | undefined;
  getTeamById: (id: string) => Team | undefined;
}

const TournamentStoreContext = createContext<TournamentStoreType | undefined>(undefined);

const LOCAL_STORAGE_KEY_MATCHES = 'kpl_kochnapur_v3_matches';
const LOCAL_STORAGE_KEY_EVENTS = 'kpl_kochnapur_v3_events';
const LOCAL_STORAGE_KEY_ADMIN = 'kpl_kochnapur_v3_is_admin';

export function TournamentStoreProvider({ children }: { children: React.ReactNode }) {
  const [tournament] = useState<Tournament>(demoTournament);
  const [teams] = useState<Team[]>(demoTeams);
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [rawMatches, setRawMatches] = useState<Match[]>(demoMatches);
  const [events, setEvents] = useState<MatchEvent[]>(demoLiveMatchEvents);
  const [lineups] = useState<MatchLineupItem[]>(demoLiveLineups);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string | null>('admin@kochnapur.live (Admin Access)');
  const [activeGoalAlert, setActiveGoalAlert] = useState<GoalAlert | null>(null);

  // Initialize from storage or Supabase
  useEffect(() => {
    // Check saved admin
    const savedAdmin = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN);
    if (savedAdmin === 'false') {
      setIsAdmin(false);
      setAdminEmail(null);
    } else {
      setIsAdmin(true);
      setAdminEmail('admin@kochnapur.live (Admin Access)');
      localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, 'true');
    }

    // Check saved matches & events from localStorage
    const savedMatches = localStorage.getItem(LOCAL_STORAGE_KEY_MATCHES);
    if (savedMatches) {
      try {
        setRawMatches(JSON.parse(savedMatches));
      } catch {
        // ignore
      }
    }

    const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch {
        // ignore
      }
    }

    // Real Supabase connectivity if configured
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'matches' },
          (payload) => {
            if (payload.eventType === 'UPDATE' && payload.new) {
              setRawMatches((prev) =>
                prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
              );
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'match_events' },
          (payload) => {
            if (payload.new) {
              setEvents((prev) => [payload.new as MatchEvent, ...prev]);
            }
          }
        )
        .subscribe((status) => {
          setIsRealtimeConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  // Broadcast channel for multi-tab real-time sync when offline / demo
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kpl_live_sync');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'MATCH_UPDATE') {
          setRawMatches(msg.data.matches);
        } else if (msg.data?.type === 'EVENT_ADD') {
          setEvents(msg.data.events);
          if (msg.data.alert) {
            triggerGoalEffect(msg.data.alert);
          }
        } else if (msg.data?.type === 'EVENT_DELETE') {
          setEvents(msg.data.events);
        }
      };
    } catch {
      // BroadcastChannel not supported in all environments
    }

    return () => {
      bc?.close();
    };
  }, [teams, players]);

  // Live match clock simulation for running matches
  useEffect(() => {
    const interval = setInterval(() => {
      setRawMatches((prev) =>
        prev.map((m) => {
          if (m.is_clock_running && (m.status === 'live_first_half' || m.status === 'live_second_half')) {
            const nextMin = m.current_minute < 90 ? m.current_minute + 1 : m.current_minute;
            return {
              ...m,
              current_minute: nextMin,
            };
          }
          return m;
        })
      );
    }, 45000); // Ticks running minute every 45s for lively sports feel

    return () => clearInterval(interval);
  }, []);

  const triggerGoalEffect = (alert: GoalAlert) => {
    setActiveGoalAlert(alert);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.3 },
        colors: [alert.team.primary_color, '#10b981', '#f59e0b', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const dismissGoalAlert = () => {
    setActiveGoalAlert(null);
  };

  // Broadcast helper
  const broadcastSync = (type: string, data: any) => {
    try {
      const bc = new BroadcastChannel('kpl_live_sync');
      bc.postMessage({ type, ...data });
      bc.close();
    } catch {
      // ignore
    }
  };

  const updateMatchScore = useCallback(
    async (
      matchId: string,
      homeScore: number,
      awayScore: number,
      status: MatchStatus,
      currentMinute: number,
      isClockRunning: boolean
    ) => {
      setRawMatches((prev) => {
        const next = prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                home_score: homeScore,
                away_score: awayScore,
                status,
                current_minute: currentMinute,
                is_clock_running: isClockRunning,
              }
            : m
        );
        localStorage.setItem(LOCAL_STORAGE_KEY_MATCHES, JSON.stringify(next));
        broadcastSync('MATCH_UPDATE', { matches: next });
        return next;
      });

      // Update Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase
            .from('matches')
            .update({
              home_score: homeScore,
              away_score: awayScore,
              status,
              current_minute: currentMinute,
              is_clock_running: isClockRunning,
            })
            .eq('id', matchId);
        } catch (err) {
          console.error('Supabase update match error:', err);
        }
      }
    },
    []
  );

  const addMatchEvent = useCallback(
    async (eventData: {
      match_id: string;
      team_id: string;
      player_id: string;
      assist_player_id?: string | null;
      event_type: EventType;
      minute: number;
      description?: string | null;
    }) => {
      const newEvent: MatchEvent = {
        id: `evt-${Date.now()}`,
        match_id: eventData.match_id,
        team_id: eventData.team_id,
        player_id: eventData.player_id,
        assist_player_id: eventData.assist_player_id,
        event_type: eventData.event_type,
        minute: eventData.minute,
        description: eventData.description,
        created_at: new Date().toISOString(),
      };

      const updatedEvents = [newEvent, ...events];
      setEvents(updatedEvents);
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));

      // If it's a goal, auto-increment score and player goal count
      let goalAlert: GoalAlert | null = null;
      if (newEvent.event_type === 'goal' || newEvent.event_type === 'penalty_goal') {
        const targetMatch = rawMatches.find((m) => m.id === newEvent.match_id);
        const scoringTeam = teams.find((t) => t.id === newEvent.team_id);
        const scoringPlayer = players.find((p) => p.id === newEvent.player_id);

        if (targetMatch && scoringTeam && scoringPlayer) {
          const isHome = targetMatch.home_team_id === scoringTeam.id;
          const nextHomeScore = isHome ? targetMatch.home_score + 1 : targetMatch.home_score;
          const nextAwayScore = !isHome ? targetMatch.away_score + 1 : targetMatch.away_score;

          updateMatchScore(
            targetMatch.id,
            nextHomeScore,
            nextAwayScore,
            targetMatch.status,
            targetMatch.current_minute,
            targetMatch.is_clock_running
          );

          goalAlert = {
            id: newEvent.id,
            matchId: targetMatch.id,
            team: scoringTeam,
            player: scoringPlayer,
            minute: newEvent.minute,
            homeScore: nextHomeScore,
            awayScore: nextAwayScore,
          };
          triggerGoalEffect(goalAlert);
        }

        // Increment player's goal count
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === newEvent.player_id ? { ...p, goals_count: (p.goals_count || 0) + 1 } : p
          )
        );
      }

      broadcastSync('EVENT_ADD', { events: updatedEvents, alert: goalAlert });

      // If Supabase is connected
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('match_events').insert({
            match_id: newEvent.match_id,
            team_id: newEvent.team_id,
            player_id: newEvent.player_id,
            assist_player_id: newEvent.assist_player_id || null,
            event_type: newEvent.event_type,
            minute: newEvent.minute,
            description: newEvent.description || null,
          });
        } catch (err) {
          console.error('Supabase add event error:', err);
        }
      }
    },
    [events, rawMatches, teams, players, updateMatchScore]
  );

  const deleteMatchEvent = useCallback(
    async (eventId: string) => {
      const updatedEvents = events.filter((e) => e.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
      broadcastSync('EVENT_DELETE', { events: updatedEvents });

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('match_events').delete().eq('id', eventId);
        } catch (err) {
          console.error('Supabase delete event error:', err);
        }
      }
    },
    [events]
  );

  const loginDemoAdmin = () => {
    setIsAdmin(true);
    setAdminEmail('admin@kochnapur.live (Demo Admin)');
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, 'true');
  };

  const loginWithSupabase = async (email: string, pass: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Fallback to demo admin login if Supabase credentials aren't set
      loginDemoAdmin();
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      setIsAdmin(true);
      setAdminEmail(data.user.email ?? email);
      localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, 'true');
    }
    return {};
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ADMIN);
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const matches = useMemo(() => {
    return getHydratedMatches(rawMatches, teams, players, events, lineups);
  }, [rawMatches, teams, players, events, lineups]);

  const getMatchById = useCallback(
    (id: string) => matches.find((m) => m.id === id),
    [matches]
  );

  const getTeamById = useCallback(
    (id: string) => teams.find((t) => t.id === id),
    [teams]
  );

  return (
    <TournamentStoreContext.Provider
      value={{
        tournament,
        teams,
        players,
        matches,
        events,
        lineups,
        isRealtimeConnected,
        isAdmin,
        adminEmail,
        activeGoalAlert,
        dismissGoalAlert,
        updateMatchScore,
        addMatchEvent,
        deleteMatchEvent,
        loginDemoAdmin,
        loginWithSupabase,
        logoutAdmin,
        getMatchById,
        getTeamById,
      }}
    >
      {children}
    </TournamentStoreContext.Provider>
  );
}

export function useTournamentStore() {
  const context = useContext(TournamentStoreContext);
  if (!context) {
    throw new Error('useTournamentStore must be used within TournamentStoreProvider');
  }
  return context;
}
