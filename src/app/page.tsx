'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Flame,
  Calendar,
  ArrowRight,
  Radio,
  Sparkles,
  Users,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { MatchCard } from '@/components/MatchCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { StandingsTable } from '@/components/StandingsTable';
import { computeTopScorers } from '@/lib/data/statsUtils';

export default function HomePage() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { tournament, matches, players, teams, events } = useTournamentStore();

  // Find live matches
  const liveMatches = matches.filter(
    (m) =>
      m.status === 'live_first_half' ||
      m.status === 'live_second_half' ||
      m.status === 'half_time' ||
      m.status === 'extra_time' ||
      m.status === 'penalties'
  );

  // Find next upcoming match for countdown
  const upcomingMatches = matches
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  const nextMatch = upcomingMatches[0];

  // Today's matches (matches from the current group matchday)
  const todaysMatches = matches.filter(
    (m) =>
      m.round.includes('Matchday 3') ||
      m.status.startsWith('live') ||
      m.id === 'match-up-1' ||
      m.id === 'match-up-2'
  );

  // Top scorers
  const topScorers = computeTopScorers(players, teams, events).slice(0, 5);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative rounded-3xl overflow-hidden glass-card border border-emerald-500/20 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.tournament.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              {getLocalizedText(tournament.name, tournament.name_bn)}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              {t.home.heroSubtitle}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {liveMatches.length > 0 ? (
                <Link
                  href={`/match/${liveMatches[0].id}`}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{t.home.watchLive}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/fixtures"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
                >
                  <span>{t.home.viewFixtures}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/standings"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition"
              >
                {t.nav.standings}
              </Link>
            </div>
          </div>

          {/* Hero Right Widget: Next Match Countdown or Live Match Highlight */}
          <div className="lg:col-span-5">
            {nextMatch && (
              <div className="rounded-2xl p-6 bg-slate-950/80 border border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    {t.home.nextMatchCountdown}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {getLocalizedText(nextMatch.round, nextMatch.round_bn)}
                  </span>
                </div>

                {/* Team Logos Clash */}
                <div className="flex items-center justify-between gap-3 py-2">
                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                    <div className="relative w-14 h-14 rounded-xl p-1 bg-slate-900 border border-slate-800">
                      <Image
                        src={nextMatch.home_team?.logo_url ?? ''}
                        alt="Home"
                        fill
                        sizes="56px"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                      {getLocalizedText(nextMatch.home_team?.name ?? '', nextMatch.home_team?.name_bn)}
                    </span>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-black text-amber-400 text-xs">
                    VS
                  </div>

                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                    <div className="relative w-14 h-14 rounded-xl p-1 bg-slate-900 border border-slate-800">
                      <Image
                        src={nextMatch.away_team?.logo_url ?? ''}
                        alt="Away"
                        fill
                        sizes="56px"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                      {getLocalizedText(nextMatch.away_team?.name ?? '', nextMatch.away_team?.name_bn)}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="pt-2 border-t border-slate-900 flex justify-center">
                  <CountdownTimer targetDate={nextMatch.match_date} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. LIVE NOW STRIP (PULSING RED BADGE) */}
      {liveMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {t.home.liveMatches}
              </h2>
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              {formatNumber(liveMatches.length)} MATCH IN PROGRESS
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} featured={true} />
            ))}
          </div>
        </section>
      )}

      {/* 3. TODAY'S MATCHES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.home.todaysMatches}
            </h2>
          </div>
          <Link
            href="/fixtures"
            className="text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            <span>{t.home.viewFixtures}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todaysMatches.slice(0, 4).map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* 4. TWO-COLUMN STATS & STANDINGS SHOWCASE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Standings Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white tracking-tight">
                {t.home.miniStandings}
              </h3>
            </div>
            <Link
              href="/standings"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {t.home.viewFullStandings} &rarr;
            </Link>
          </div>

          <StandingsTable compact={true} />
        </div>

        {/* Right Column: Top Scorers Contenders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-black text-white tracking-tight">
                {t.home.topPerformers}
              </h3>
            </div>
            <Link
              href="/stats"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {t.home.viewAllStats} &rarr;
            </Link>
          </div>

          <div className="rounded-2xl glass-card divide-y divide-slate-800/80 overflow-hidden">
            {topScorers.map((row) => (
              <div
                key={row.player.id}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-800/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center font-mono ${
                      row.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : row.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : row.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatNumber(row.rank)}
                  </span>

                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700">
                    <Image
                      src={row.player.photo_url}
                      alt={row.player.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate leading-tight">
                      {getLocalizedText(row.player.name, row.player.name_bn)}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {getLocalizedText(row.team.name, row.team.name_bn)} • #{formatNumber(row.player.jersey_number)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {formatNumber(row.goals)}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    {t.stats.goals}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOURNAMENT HIGHLIGHT STATS BAR */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-white font-mono">
              {formatNumber(8)}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.home.activeTeams}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {formatNumber(16)}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.home.totalMatches}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
              {formatNumber(4)}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.home.stadiums}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
              {formatNumber(12)}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.home.daysOfAction}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
