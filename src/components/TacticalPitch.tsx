'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { Match, MatchLineupItem, Player, Team } from '@/lib/types';
import { useLanguage } from './LanguageContext';

interface TacticalPitchProps {
  match: Match;
}

export function TacticalPitch({ match }: TacticalPitchProps) {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const [selectedTeamTab, setSelectedTeamTab] = useState<'home' | 'away'>('home');

  const home = match.home_team;
  const away = match.away_team;

  if (!home || !away) return null;

  const currentTeam: Team = selectedTeamTab === 'home' ? home : away;
  const lineups = match.lineups ?? [];

  // Filter lineups for selected team
  const teamLineups = lineups.filter((l) => l.team_id === currentTeam.id);
  const starters = teamLineups.filter((l) => l.is_starter);
  const bench = teamLineups.filter((l) => !l.is_starter);

  return (
    <div className="space-y-6">
      {/* Team Switcher Tabs */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setSelectedTeamTab('home')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition border ${
            selectedTeamTab === 'home'
              ? 'bg-slate-900 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: home.primary_color }}
          />
          <span>{getLocalizedText(home.name, home.name_bn)}</span>
        </button>

        <button
          onClick={() => setSelectedTeamTab('away')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition border ${
            selectedTeamTab === 'away'
              ? 'bg-slate-900 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: away.primary_color }}
          />
          <span>{getLocalizedText(away.name, away.name_bn)}</span>
        </button>
      </div>

      {/* PITCH VISUALIZATION */}
      <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/80 bg-pitch">
        {/* Pitch Lines (FIFA Standard Styling) */}
        <div className="absolute inset-4 sm:inset-6 border-2 border-white/30 pointer-events-none rounded-lg">
          {/* Halfway Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2" />

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-40 sm:h-40 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white/40 rounded-full" />
          </div>

          {/* Top Penalty Box (Away End) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-24 sm:h-28 border-b-2 border-x-2 border-white/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-10 border-b-2 border-x-2 border-white/30" />
          <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full" />

          {/* Bottom Penalty Box (Home End) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-24 sm:h-28 border-t-2 border-x-2 border-white/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-10 border-t-2 border-x-2 border-white/30" />
          <div className="absolute bottom-18 sm:bottom-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full" />
        </div>

        {/* Formation Starters on Pitch */}
        {starters.map((item) => {
          const p = item.player;
          if (!p) return null;

          const posX = item.grid_x ?? 50;
          const posY = item.grid_y ?? 50;

          return (
            <div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              {/* Player Avatar Circle */}
              <div
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 p-0.5 shadow-xl transition transform group-hover:scale-115"
                style={{
                  borderColor: currentTeam.primary_color,
                  backgroundColor: '#0f172a',
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={p.photo_url}
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                {/* Jersey Number Tag */}
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black text-slate-950 flex items-center justify-center shadow-md font-mono"
                  style={{ backgroundColor: currentTeam.primary_color }}
                >
                  {formatNumber(p.jersey_number)}
                </span>
                {p.is_captain && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center shadow">
                    C
                  </span>
                )}
              </div>

              {/* Player Name Card */}
              <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-white/10 text-center max-w-[90px] shadow-md group-hover:border-emerald-400 transition">
                <p className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-none">
                  {getLocalizedText(p.name, p.name_bn)}
                </p>
                <span className="text-[8px] font-bold text-emerald-400 uppercase">
                  {item.formation_position || p.position}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Substitutes Bench */}
      <div className="rounded-2xl glass-card p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{t.match.substitutes}</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {bench.map((item) => {
            const p = item.player;
            if (!p) return null;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                  <Image
                    src={p.photo_url}
                    alt={p.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-none">
                    {getLocalizedText(p.name, p.name_bn)}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    #{formatNumber(p.jersey_number)} • {p.position}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
