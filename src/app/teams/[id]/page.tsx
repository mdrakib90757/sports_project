'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Shield,
  Users,
  Trophy,
  Flame,
  Award,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { MatchCard } from '@/components/MatchCard';
import { PlayerPosition } from '@/lib/types';

function TeamProfileInner() {
  const params = useParams();
  const teamId = params?.id as string;
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { getTeamById, players, matches } = useTournamentStore();

  const [positionFilter, setPositionFilter] = useState<'ALL' | PlayerPosition>('ALL');

  const team = getTeamById(teamId);

  if (!team) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Team Not Found</h2>
        <p className="text-slate-400">The requested team ID does not exist.</p>
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.teams.title}</span>
        </Link>
      </div>
    );
  }

  // Filter team squad
  const teamPlayers = players.filter((p) => p.team_id === team.id);
  const filteredPlayers =
    positionFilter === 'ALL'
      ? teamPlayers
      : teamPlayers.filter((p) => p.position === positionFilter);

  // Filter team matches
  const teamMatches = matches.filter(
    (m) => m.home_team_id === team.id || m.away_team_id === team.id
  );

  return (
    <div className="space-y-10">
      {/* Back button */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.teams.title}</span>
      </Link>

      {/* CLUB HERO HEADER */}
      <section
        className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border shadow-2xl"
        style={{
          borderColor: `${team.primary_color}40`,
          background: `radial-gradient(circle at 10% 20%, ${team.primary_color}25 0%, transparent 50%), linear-gradient(135deg, #090d16 0%, #030712 100%)`,
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Logo */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-3 flex items-center justify-center border shadow-2xl flex-shrink-0"
            style={{
              borderColor: `${team.primary_color}80`,
              backgroundColor: `${team.primary_color}20`,
              boxShadow: `0 15px 35px -10px ${team.primary_color}50`,
            }}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={team.logo_url}
                alt={team.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {team.group_name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {team.short_name}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {getLocalizedText(team.name, team.name_bn)}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>
                  {getLocalizedText(team.city, team.city_bn)} • {getLocalizedText(team.stadium, team.stadium_bn)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>
                  {t.teams.manager}: {getLocalizedText(team.coach, team.coach_bn)}
                </span>
              </div>
            </div>
          </div>

          {/* Color Identity Swatch */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="space-y-1 text-right text-[11px] font-mono text-slate-400">
              <p>Primary</p>
              <p>Secondary</p>
            </div>
            <div className="space-y-1">
              <div
                className="w-5 h-5 rounded-md border border-slate-700"
                style={{ backgroundColor: team.primary_color }}
              />
              <div
                className="w-5 h-5 rounded-md border border-slate-700"
                style={{ backgroundColor: team.secondary_color }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SQUAD SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              {t.teams.squad} ({formatNumber(teamPlayers.length)})
            </h2>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 overflow-x-auto">
            {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                  positionFilter === pos
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pos === 'ALL' ? 'All Positions' : pos}
              </button>
            ))}
          </div>
        </div>

        {/* Squad Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="relative rounded-2xl glass-card overflow-hidden p-4 flex flex-col justify-between group hover:border-emerald-500/40 transition"
            >
              {player.is_captain && (
                <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>{t.teams.captain}</span>
                </div>
              )}

              {/* Jersey Number in top-right */}
              <div className="absolute top-3 right-3 z-10">
                <span
                  className="w-7 h-7 rounded-lg text-xs font-black text-slate-950 flex items-center justify-center font-mono shadow-md"
                  style={{ backgroundColor: team.primary_color }}
                >
                  {formatNumber(player.jersey_number)}
                </span>
              </div>

              {/* Player Photo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 border-slate-700/80 my-2 group-hover:scale-105 transition transform">
                <Image
                  src={player.photo_url}
                  alt={player.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Player details */}
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate leading-snug">
                  {getLocalizedText(player.name, player.name_bn)}
                </h4>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {player.position}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-around text-center text-xs">
                <div>
                  <span className="font-mono font-bold text-white">
                    {formatNumber(player.goals_count)}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    {t.teams.goals}
                  </span>
                </div>
                <div>
                  <span className="font-mono font-bold text-white">
                    {formatNumber(player.assists_count)}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    {t.teams.assists}
                  </span>
                </div>
                <div>
                  <span className="font-mono font-bold text-amber-400">
                    {formatNumber(player.yellow_cards)}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    YC
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM FIXTURES & RESULTS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">
            {t.teams.recentMatches} ({formatNumber(teamMatches.length)})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMatches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function TeamProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading club profile...</p>
        </div>
      }
    >
      <TeamProfileInner />
    </React.Suspense>
  );
}
