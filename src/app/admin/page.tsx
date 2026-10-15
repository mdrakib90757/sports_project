'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { MatchStatus, EventType } from '@/lib/types';

export default function AdminPage() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
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
  } = useTournamentStore();

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

      {/* MATCH SELECTOR BAR */}
      <div className="p-4 rounded-2xl glass-card space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {t.admin.selectMatch}
        </label>
        <select
          value={selectedMatchId}
          onChange={(e) => handleSelectMatch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              [{m.status.toUpperCase()}] {m.home_team?.name} vs {m.away_team?.name} — (
              {m.home_score} - {m.away_score}) • {m.round}
            </option>
          ))}
        </select>
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
            <div className="grid grid-cols-2 gap-6 items-center">
              {/* Home Score */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <span className="text-xs font-bold text-slate-300 truncate block">
                  {getLocalizedText(home.name, home.name_bn)}
                </span>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                  >
                    -
                  </button>
                  <span className="text-4xl font-black font-mono text-emerald-400 w-12">
                    {formatNumber(homeScore)}
                  </span>
                  <button
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
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
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                  >
                    -
                  </button>
                  <span className="text-4xl font-black font-mono text-emerald-400 w-12">
                    {formatNumber(awayScore)}
                  </span>
                  <button
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
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
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as MatchStatus)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live_first_half">1st Half (Live)</option>
                  <option value="half_time">Half Time</option>
                  <option value="live_second_half">2nd Half (Live)</option>
                  <option value="extra_time">Extra Time</option>
                  <option value="penalties">Penalties</option>
                  <option value="full_time">Full Time (Completed)</option>
                  <option value="postponed">Postponed</option>
                </select>
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
                    <select
                      value={eventTeamId}
                      onChange={(e) => {
                        setEventTeamId(e.target.value);
                        setEventPlayerId('');
                        setAssistPlayerId('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value={home.id}>{getLocalizedText(home.name, home.name_bn)} (Home)</option>
                      <option value={away.id}>{getLocalizedText(away.name, away.name_bn)} (Away)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.eventType}
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="goal">Goal (Regular)</option>
                      <option value="penalty_goal">Goal (Penalty)</option>
                      <option value="yellow_card">Yellow Card</option>
                      <option value="red_card">Red Card</option>
                      <option value="substitution">Substitution</option>
                      <option value="own_goal">Own Goal</option>
                    </select>
                  </div>
                </div>

                {/* Primary Player */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">
                    {t.admin.eventPlayer}
                  </label>
                  <select
                    value={eventPlayerId}
                    onChange={(e) => setEventPlayerId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="">-- Choose Player --</option>
                    {currentTeamPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.jersey_number} - {getLocalizedText(p.name, p.name_bn)} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assist Player (if Goal) */}
                {(eventType === 'goal' || eventType === 'penalty_goal') && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      {t.admin.assistPlayer}
                    </label>
                    <select
                      value={assistPlayerId}
                      onChange={(e) => setAssistPlayerId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="">-- None / Solo Effort --</option>
                      {currentTeamPlayers
                        .filter((p) => p.id !== eventPlayerId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.jersey_number} - {getLocalizedText(p.name, p.name_bn)}
                          </option>
                        ))}
                    </select>
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
    </div>
  );
}
