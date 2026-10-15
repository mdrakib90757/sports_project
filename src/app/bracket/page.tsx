'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { Match, Team } from '@/lib/types';

export default function BracketPage() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { matches, tournament } = useTournamentStore();

  const qfMatches = matches
    .filter((m) => m.stage === 'quarter_final')
    .sort((a, b) => (a.bracket_slot || 0) - (b.bracket_slot || 0));

  const sfMatches = matches
    .filter((m) => m.stage === 'semi_final')
    .sort((a, b) => (a.bracket_slot || 0) - (b.bracket_slot || 0));

  const finalMatch = matches.find((m) => m.stage === 'final');

  const renderBracketMatchCard = (match?: Match, title?: string) => {
    if (!match) {
      return (
        <div className="w-64 rounded-2xl p-4 bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
          {t.bracket.tbd}
        </div>
      );
    }

    const home = match.home_team;
    const away = match.away_team;
    const isFinished = match.status === 'full_time';
    const isLive = match.status.startsWith('live');

    return (
      <div className="w-64 sm:w-72 rounded-2xl glass-card p-4 border border-slate-800 hover:border-emerald-500/40 transition shadow-lg relative group">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-3">
          <span className="uppercase tracking-wider text-emerald-400 truncate">
            {getLocalizedText(match.round, match.round_bn)}
          </span>
          {isLive ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold animate-pulse">
              LIVE
            </span>
          ) : isFinished ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
              FT
            </span>
          ) : (
            <span className="text-slate-500 font-mono">
              {new Date(match.match_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {home ? (
              <>
                <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-700 flex-shrink-0">
                  <Image
                    src={home.logo_url}
                    alt={home.name}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {getLocalizedText(home.name, home.name_bn)}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500">{t.bracket.tbd}</span>
            )}
          </div>
          <span className="font-mono text-sm font-black text-slate-200">
            {isFinished || isLive ? formatNumber(match.home_score) : '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {away ? (
              <>
                <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-700 flex-shrink-0">
                  <Image
                    src={away.logo_url}
                    alt={away.name}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {getLocalizedText(away.name, away.name_bn)}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500">{t.bracket.tbd}</span>
            )}
          </div>
          <span className="font-mono text-sm font-black text-slate-200">
            {isFinished || isLive ? formatNumber(match.away_score) : '-'}
          </span>
        </div>

        <Link
          href={`/match/${match.id}`}
          className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 transition"
        >
          <span>{t.common.viewDetails}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Road to the Championship</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.bracket.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          {t.bracket.subtitle}
        </p>
      </div>

      {/* TOURNAMENT BRACKET BOARD */}
      <div className="overflow-x-auto pb-8">
        <div className="min-w-[960px] p-6 rounded-3xl glass-card border border-slate-800 bg-slate-950/70">
          <div className="grid grid-cols-3 gap-12 items-center">
            {/* COLUMN 1: QUARTER FINALS */}
            <div className="space-y-6">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                  {t.bracket.quarterFinals}
                </h3>
              </div>
              <div className="space-y-6">
                {qfMatches.map((m) => (
                  <div key={m.id} className="relative">
                    {renderBracketMatchCard(m)}
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: SEMI FINALS */}
            <div className="space-y-6">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">
                  {t.bracket.semiFinals}
                </h3>
              </div>
              <div className="space-y-24 py-12">
                {sfMatches.map((m) => (
                  <div key={m.id} className="relative">
                    {renderBracketMatchCard(m)}
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: GRAND FINAL & TROPHY */}
            <div className="space-y-6">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                  {t.bracket.final}
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center space-y-6 py-6">
                {renderBracketMatchCard(finalMatch)}

                {/* Champion Trophy Showcase */}
                <div className="text-center space-y-2 p-6 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 max-w-[260px] shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    {t.bracket.champion}
                  </h4>
                  <p className="text-xs text-amber-400 font-semibold">
                    {getLocalizedText(tournament.name, tournament.name_bn)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
