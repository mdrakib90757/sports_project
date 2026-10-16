'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  Radio,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Play,
  Pause,
  Send,
  CheckCircle,
  AlertCircle,
  Trophy,
  Users,
  Flame,
  ArrowRightLeft,
  Clock,
  Sparkles,
  Search,
  Filter,
  UserPlus,
  X,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { MatchStatus, EventType, PlayerLevel, PlayerPosition } from '@/lib/types';
import { Select } from '@/shared/ui/Select';

export default function AdminPage() {
  const { language, t, getLocalizedText, formatNumber } = useLanguage();
  const {
    matches,
    teams,
    players,
    events,
    isAdmin,
    adminEmail,
    loginDemoAdmin,
    loginWithSupabase,
    logoutAdmin,
    updateMatchScore,
    addMatchEvent,
    deleteMatchEvent,
    isRealtimeConnected,
    updatePlayerLevel,
    addPlayer,
  } = useTournamentStore();

  const [adminTab, setAdminTab] = useState<'matches' | 'players'>('matches');
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerLevelFilter, setPlayerLevelFilter] = useState<'ALL' | PlayerLevel | 'UNASSIGNED'>('ALL');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNameBn, setNewPlayerNameBn] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>('FWD');
  const [newPlayerLevel, setNewPlayerLevel] = useState<PlayerLevel>('A');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@kochnapur.live');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Selected match for live controls
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches.find((m) => m.status.startsWith('live'))?.id || matches[0]?.id || ''
  );

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Match state controls
  const [homeScore, setHomeScore] = useState<number>(selectedMatch?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState<number>(selectedMatch?.away_score ?? 0);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(selectedMatch?.status ?? 'upcoming');
  const [currentMinute, setCurrentMinute] = useState<number>(selectedMatch?.current_minute ?? 0);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(selectedMatch?.is_clock_running ?? false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Event creation form state
  const [eventTeamId, setEventTeamId] = useState<string>(selectedMatch?.home_team_id ?? '');
  const [eventType, setEventType] = useState<EventType>('goal');
  const [eventPlayerId, setEventPlayerId] = useState<string>('');
  const [assistPlayerId, setAssistPlayerId] = useState<string>('');
  const [eventMinute, setEventMinute] = useState<number>(selectedMatch?.current_minute ?? 68);
  const [eventDescription, setEventDescription] = useState<string>('');

  // Synchronize state when selected match changes
  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    const m = matches.find((item) => item.id === matchId);
    if (m) {
      setHomeScore(m.home_score);
      setAwayScore(m.away_score);
      setMatchStatus(m.status);
      setCurrentMinute(m.current_minute);
      setIsClockRunning(m.is_clock_running);
      setEventTeamId(m.home_team_id);
      setEventMinute(m.current_minute || 1);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError(null);

    const result = await loginWithSupabase(emailInput, passwordInput);
    if (result.error) {
      setLoginError(result.error);
    }
    setIsSubmittingLogin(false);
  };

  // Handle Score Broadcast
  const handleBroadcastMatchState = async () => {
    if (!selectedMatch) return;
    await updateMatchScore(
      selectedMatch.id,
      homeScore,
      awayScore,
      matchStatus,
      currentMinute,
      isClockRunning
    );
    showToast(t.admin.successUpdate);
  };

  // Handle Add Match Event
  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !eventPlayerId || !eventTeamId) return;

    await addMatchEvent({
      match_id: selectedMatch.id,
      team_id: eventTeamId,
      player_id: eventPlayerId,
      assist_player_id: assistPlayerId ? assistPlayerId : null,
      event_type: eventType,
      minute: Number(eventMinute),
      description: eventDescription || null,
    });

    // Reset event form
    setEventDescription('');
    showToast(t.admin.successEvent);
  };

  const home = selectedMatch?.home_team;
  const away = selectedMatch?.away_team;
  const currentTeamPlayers = players.filter((p) => p.team_id === eventTeamId);
  const matchEvents = events.filter((e) => e.match_id === selectedMatch?.id);

  // If user is not authenticated as admin, show Login screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {t.admin.loginTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {t.admin.loginSubtitle}
          </p>
        </div>

        {/* PROMINENT ONE-CLICK ENTER BUTTON */}
        <button
          type="button"
          onClick={loginDemoAdmin}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition transform active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>⚡ এক ক্লিকে অ্যাডমিন কন্ট্রোলে প্রবেশ করুন</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-[11px] uppercase font-mono">
            অথবা পাসওয়ার্ড দিয়ে লগইন
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {t.admin.email}
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {t.admin.password}
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingLogin}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {isSubmittingLogin ? 'Signing In...' : t.admin.signIn}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-mono">
            or instant evaluation
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          onClick={loginDemoAdmin}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.admin.demoLogin}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP ADMIN HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">{t.admin.title}</h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {adminEmail} • {isSupabaseConfigured() ? t.admin.liveSupabase : t.admin.demoMode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">
              {isRealtimeConnected ? 'Realtime Broadcast Ready' : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-xs font-bold text-slate-300 hover:text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* ADMIN MODULE TAB SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('matches')}
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              adminTab === 'matches'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{language === 'bn' ? 'ম্যাচ কন্ট্রোল রুম' : 'Live Match Control'}</span>
          </button>

          <button
            onClick={() => setAdminTab('players')}
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              adminTab === 'players'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'bn' ? 'খেলোয়াড় ও লেভেল নির্ধারণ' : 'Players & Leveling'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-950/30 text-current">
              {formatNumber(players.length)}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/presentation"
            className="h-9 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'উদ্বোধনী ভিআইপি শো' : 'Launch VIP Show'}</span>
          </Link>

          <Link
            href="/draw"
            className="h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লাইভ ড্র সেন্টার' : 'Live Draw Center'}</span>
          </Link>
        </div>
      </div>

      {/* TAB 1: MATCHES CONSOLE */}
      {adminTab === 'matches' && (
        <>
          {/* MATCH SELECTOR BAR */}
          <div className="p-4 rounded-2xl glass-card space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {t.admin.selectMatch}
        </label>
        <Select
          value={selectedMatchId}
          onChange={(val) => handleSelectMatch(val)}
          placeholder={t.admin.selectMatch}
          options={matches.map((m) => ({
            value: m.id,
            label: `${m.home_team?.name || 'Home'} vs ${m.away_team?.name || 'Away'} (${m.home_score} - ${m.away_score})`,
            labelBn: `${m.home_team?.name_bn || ''} বনাম ${m.away_team?.name_bn || ''}`,
            badge: m.status.toUpperCase(),
            avatarUrl: m.home_team?.logo_url,
          }))}
        />
      </div>

      {/* MAIN TWO-COLUMN ADMIN CONSOLE */}
      {selectedMatch && home && away && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: LIVE SCORE & MATCH STATE CONSOLE */}
          <div className="lg:col-span-6 rounded-3xl glass-card p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <span>Live Scoreboard Controller</span>
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedMatch.round}
              </span>
            </div>

            {/* Score Adjuster Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center">
              {/* Home Score */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <span className="text-xs font-bold text-slate-300 truncate block">
                  {getLocalizedText(home.name, home.name_bn)}
                </span>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-95 transition flex items-center justify-center shadow-sm"
                    aria-label="Decrease home score"
                  >
                    -
                  </button>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 w-12 text-center">
                    {formatNumber(homeScore)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-95 transition flex items-center justify-center shadow-sm"
                    aria-label="Increase home score"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Away Score */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <span className="text-xs font-bold text-slate-300 truncate block">
                  {getLocalizedText(away.name, away.name_bn)}
                </span>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-95 transition flex items-center justify-center shadow-sm"
                    aria-label="Decrease away score"
                  >
                    -
                  </button>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 w-12 text-center">
                    {formatNumber(awayScore)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-95 transition flex items-center justify-center shadow-sm"
                    aria-label="Increase away score"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Status & Minute Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">
                  {t.admin.matchStatus}
                </label>
                <Select
                  value={matchStatus}
                  onChange={(val) => setMatchStatus(val as MatchStatus)}
                  placeholder="Select Status"
                  options={[
                    { value: 'upcoming', label: 'Upcoming', badge: 'WAITING' },
                    { value: 'live_first_half', label: '1st Half (Live)', badge: 'LIVE' },
                    { value: 'half_time', label: 'Half Time', badge: 'HT' },
                    { value: 'live_second_half', label: '2nd Half (Live)', badge: 'LIVE' },
                    { value: 'extra_time', label: 'Extra Time', badge: 'ET' },
                    { value: 'penalties', label: 'Penalties', badge: 'PEN' },
                    { value: 'full_time', label: 'Full Time (Completed)', badge: 'FT' },
                    { value: 'postponed', label: 'Postponed', badge: 'POSTP' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">
                  {t.admin.minute}
                </label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={currentMinute}
                  onChange={(e) => setCurrentMinute(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Clock Ticker Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{t.admin.clockRunning}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsClockRunning(!isClockRunning)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  isClockRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isClockRunning ? t.admin.pauseClock : t.admin.startClock}</span>
              </button>
            </div>

            {/* Broadcast Button */}
            <button
              onClick={handleBroadcastMatchState}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>{t.admin.saveMatchState}</span>
            </button>
          </div>

          {/* RIGHT: REAL-TIME MATCH EVENT CREATOR & LOG */}
          <div className="lg:col-span-6 space-y-6">
            {/* Add Event Form */}
            <div className="rounded-3xl glass-card p-6 sm:p-8 border border-slate-800 space-y-5">
              <h2 className="text-base font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>{t.admin.addMatchEvent}</span>
              </h2>

              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                {/* Team Selector & Event Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Team</label>
                    <Select
                      value={eventTeamId}
                      onChange={(val) => {
                        setEventTeamId(val);
                        setEventPlayerId('');
                        setAssistPlayerId('');
                      }}
                      options={[
                        {
                          value: home.id,
                          label: `${getLocalizedText(home.name, home.name_bn)} (Home)`,
                          avatarUrl: home.logo_url,
                        },
                        {
                          value: away.id,
                          label: `${getLocalizedText(away.name, away.name_bn)} (Away)`,
                          avatarUrl: away.logo_url,
                        },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.eventType}
                    </label>
                    <Select
                      value={eventType}
                      onChange={(val) => setEventType(val as EventType)}
                      options={[
                        { value: 'goal', label: 'Goal (Regular)', badge: 'GOAL' },
                        { value: 'penalty_goal', label: 'Goal (Penalty)', badge: 'PEN' },
                        { value: 'yellow_card', label: 'Yellow Card', badge: 'YC' },
                        { value: 'red_card', label: 'Red Card', badge: 'RC' },
                        { value: 'substitution', label: 'Substitution', badge: 'SUB' },
                        { value: 'own_goal', label: 'Own Goal', badge: 'OG' },
                      ]}
                    />
                  </div>
                </div>

                {/* Primary Player */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">
                    {t.admin.eventPlayer}
                  </label>
                  <Select
                    value={eventPlayerId}
                    onChange={(val) => setEventPlayerId(val)}
                    placeholder="-- Choose Player --"
                    searchable="auto"
                    options={currentTeamPlayers.map((p) => ({
                      value: p.id,
                      label: `#${p.jersey_number} - ${getLocalizedText(p.name, p.name_bn)}`,
                      badge: p.position,
                      avatarUrl: p.photo_url,
                    }))}
                  />
                </div>

                {/* Assist Player (if Goal) */}
                {(eventType === 'goal' || eventType === 'penalty_goal') && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.assistPlayer}
                    </label>
                    <Select
                      value={assistPlayerId}
                      onChange={(val) => setAssistPlayerId(val)}
                      placeholder="-- None / Solo Effort --"
                      searchable="auto"
                      options={[
                        { value: '', label: '-- None / Solo Effort --' },
                        ...currentTeamPlayers
                          .filter((p) => p.id !== eventPlayerId)
                          .map((p) => ({
                            value: p.id,
                            label: `#${p.jersey_number} - ${getLocalizedText(p.name, p.name_bn)}`,
                            avatarUrl: p.photo_url,
                          })),
                      ]}
                    />
                  </div>
                )}

                {/* Minute & Commentary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.eventMinute}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="125"
                      value={eventMinute}
                      onChange={(e) => setEventMinute(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.eventDescription}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Curled into upper corner from outside the box"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.admin.submitEvent}</span>
                </button>
              </form>
            </div>

            {/* Live Events Log for Selected Match */}
            <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>{t.admin.recentEvents} ({formatNumber(matchEvents.length)})</span>
              </h3>

              {matchEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No recorded events for this match yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                  {matchEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-emerald-400">
                          {formatNumber(evt.minute)}&apos;
                        </span>
                        <span className="font-bold text-white uppercase text-[11px] px-1.5 py-0.5 rounded bg-slate-800">
                          {evt.event_type}
                        </span>
                        <span className="text-slate-300 truncate font-semibold">
                          {getLocalizedText(evt.player?.name ?? 'Player', evt.player?.name_bn)}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteMatchEvent(evt.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                        title={t.admin.deleteEvent}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )}

      {/* TAB 2: PLAYERS & LEVELING CONSOLE */}
      {adminTab === 'players' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-bold uppercase">
                {language === 'bn' ? 'মোট খেলোয়াড়' : 'Total Players'}
              </div>
              <div className="text-xl font-black text-white mt-1">{formatNumber(players.length)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-lime-400/30">
              <div className="text-[11px] text-lime-400 font-bold uppercase">Level A (স্টার)</div>
              <div className="text-xl font-black text-lime-400 mt-1">
                {formatNumber(players.filter((p) => p.level === 'A').length)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
              <div className="text-[11px] text-emerald-400 font-bold uppercase">Level B (অভিজ্ঞ)</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {formatNumber(players.filter((p) => p.level === 'B').length)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30">
              <div className="text-[11px] text-sky-400 font-bold uppercase">Level C (স্কোয়াড)</div>
              <div className="text-xl font-black text-sky-400 mt-1">
                {formatNumber(players.filter((p) => p.level === 'C').length)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30">
              <div className="text-[11px] text-amber-400 font-bold uppercase">EXTRA (রিজার্ভ)</div>
              <div className="text-xl font-black text-amber-400 mt-1">
                {formatNumber(players.filter((p) => p.level === 'EXTRA').length)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30">
              <div className="text-[11px] text-purple-400 font-bold uppercase">
                {language === 'bn' ? 'ড্র পুলে অপেক্ষমাণ' : 'In Draw Pool'}
              </div>
              <div className="text-xl font-black text-purple-400 mt-1">
                {formatNumber(players.filter((p) => !p.team_id).length)}
              </div>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {(['ALL', 'A', 'B', 'C', 'EXTRA', 'UNASSIGNED'] as const).map((lvl) => {
                  const isActive = playerLevelFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setPlayerLevelFilter(lvl)}
                      className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? 'bg-lime-400 text-slate-950 font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {lvl === 'ALL'
                        ? (language === 'bn' ? 'সকল' : 'All')
                        : lvl === 'UNASSIGNED'
                        ? (language === 'bn' ? 'পুলে বাকি' : 'In Pool')
                        : `Level ${lvl}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Player Action */}
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="h-10 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-lime-400/20 transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন প্লেয়ার যোগ করুন' : 'Add Player Manually'}</span>
            </button>
          </div>

          {/* Players Roster Grid */}
          {(() => {
            const filtered = players.filter((p) => {
              const matchesSearch =
                !playerSearch ||
                p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                (p.name_bn && p.name_bn.includes(playerSearch)) ||
                (p.phone && p.phone.includes(playerSearch));
              const matchesLevel =
                playerLevelFilter === 'ALL'
                  ? true
                  : playerLevelFilter === 'UNASSIGNED'
                  ? !p.team_id
                  : p.level === playerLevelFilter;
              return matchesSearch && matchesLevel;
            });

            if (filtered.length === 0) {
              return (
                <div className="py-16 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                  <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">
                    {language === 'bn' ? 'কোনো খেলোয়াড় খুঁজে পাওয়া যায়নি' : 'No players found matching your criteria'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((player) => {
                  const playerTeam = teams.find((t) => t.id === player.team_id);
                  const isCaptain = player.is_captain || (player as any).isCaptain;

                  return (
                    <div
                      key={player.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          <img
                            src={player.photo_url || (player as any).photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white truncate">
                              {getLocalizedText(player.name, player.name_bn || (player as any).nameBn)}
                            </h4>
                            {isCaptain && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                C
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{player.phone || 'No phone'}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300">
                              {player.position}
                            </span>
                            {player.jersey_number && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                #{formatNumber(player.jersey_number)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Level Selection Bar */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>{language === 'bn' ? 'লেভেল নির্ধারণ করুন:' : 'Assign Level:'}</span>
                          <span className="text-lime-400 font-black">Level {player.level || 'A'}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                          {(['A', 'B', 'C', 'EXTRA'] as const).map((lvl) => {
                            const isSelected = player.level === lvl;
                            return (
                              <button
                                key={lvl}
                                onClick={async () => {
                                  await updatePlayerLevel(player.id, lvl);
                                  showToast(
                                    language === 'bn'
                                      ? `${player.name} এর লেভেল ${lvl} এ আপডেট করা হয়েছে`
                                      : `${player.name} assigned to Level ${lvl}`
                                  );
                                }}
                                className={`h-8 rounded-xl text-xs font-black transition-all ${
                                  isSelected
                                    ? lvl === 'A'
                                      ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                                      : lvl === 'B'
                                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                                      : lvl === 'C'
                                      ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                                      : 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Draft Team Info */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{language === 'bn' ? 'বর্তমান দল:' : 'Team:'}</span>
                        {playerTeam ? (
                          <Link
                            href={`/teams/${playerTeam.id}`}
                            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 group"
                          >
                            <img src={playerTeam.logo_url} alt="" className="w-3.5 h-3.5 object-contain" />
                            <span className="truncate max-w-[130px]">
                              {getLocalizedText(playerTeam.name, playerTeam.name_bn)}
                            </span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ) : (
                          <span className="text-amber-400/90 font-medium">
                            {language === 'bn' ? 'ড্র পুলে অপেক্ষমাণ' : 'In Draw Pool'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ADD PLAYER MODAL */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-lime-400" />
                <span>{language === 'bn' ? 'নতুন খেলোয়াড় যোগ করুন' : 'Add New Player'}</span>
              </h3>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newPlayerName.trim() || !newPlayerPhone.trim()) return;

                await addPlayer({
                  name: newPlayerName.trim(),
                  nameBn: newPlayerNameBn.trim() || undefined,
                  phone: newPlayerPhone.trim(),
                  position: newPlayerPosition,
                  level: newPlayerLevel,
                  photoUrl: newPlayerPhoto.trim() || undefined,
                });

                showToast(
                  language === 'bn'
                    ? `${newPlayerName} সফলভাবে যোগ করা হয়েছে`
                    : `${newPlayerName} successfully added`
                );

                setNewPlayerName('');
                setNewPlayerNameBn('');
                setNewPlayerPhone('');
                setNewPlayerPhoto('');
                setShowAddPlayerModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  {language === 'bn' ? 'খেলোয়াড়ের নাম (ইংরেজিতে) *' : 'Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakib Al Hasan"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  {language === 'bn' ? 'খেলোয়াড়ের নাম (বাংলায়)' : 'Name (Bangla)'}
                </label>
                <input
                  type="text"
                  placeholder="উদাঃ সাকিব আল হাসান"
                  value={newPlayerNameBn}
                  onChange={(e) => setNewPlayerNameBn(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01700000000"
                  value={newPlayerPhone}
                  onChange={(e) => setNewPlayerPhone(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    {language === 'bn' ? 'পজিশন' : 'Position'}
                  </label>
                  <select
                    value={newPlayerPosition}
                    onChange={(e) => setNewPlayerPosition(e.target.value as PlayerPosition)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="FWD">FWD (Forward)</option>
                    <option value="MID">MID (Midfielder)</option>
                    <option value="DEF">DEF (Defender)</option>
                    <option value="GK">GK (Goalkeeper)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    {language === 'bn' ? 'প্রাথমিক লেভেল' : 'Initial Level'}
                  </label>
                  <select
                    value={newPlayerLevel}
                    onChange={(e) => setNewPlayerLevel(e.target.value as PlayerLevel)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="A">Level A (Star)</option>
                    <option value="B">Level B (Core)</option>
                    <option value="C">Level C (Squad)</option>
                    <option value="EXTRA">EXTRA (Reserve)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  {language === 'bn' ? 'ছবির লিংক (ঐচ্ছিক)' : 'Photo URL (Optional)'}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPlayerPhoto}
                  onChange={(e) => setNewPlayerPhoto(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black shadow-lg shadow-lime-400/20"
                >
                  {language === 'bn' ? 'প্লেয়ার যুক্ত করুন' : 'Save Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
