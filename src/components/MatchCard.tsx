'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Image as ImageIcon, MapPin, Radio } from 'lucide-react';
import { Match } from '@/lib/types';
import { useLanguage } from './LanguageContext';
import { MatchPosterModal } from './MatchPosterModal';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

export function MatchCard({ match, featured = false }: MatchCardProps) {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  const home = match.home_team;
  const away = match.away_team;

  if (!home || !away) return null;

  const isLive =
    match.status === 'live_first_half' ||
    match.status === 'live_second_half' ||
    match.status === 'half_time' ||
    match.status === 'extra_time' ||
    match.status === 'penalties';

  const isFinished = match.status === 'full_time';

  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div
        className={`relative rounded-2xl overflow-hidden glass-card glass-card-hover transition-all duration-300 ${
          featured
            ? 'p-6 sm:p-7 border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/20 shadow-2xl'
            : 'p-5 sm:p-6'
        }`}
      >
        {/* Subtle Team Color Gradients along top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1" style={{ backgroundColor: home.primary_color }} />
          <div className="flex-1" style={{ backgroundColor: away.primary_color }} />
        </div>

        {/* Card Header: Round & Status */}
        <div className="flex items-center justify-between gap-2 mb-4 text-xs">
          <span className="font-semibold text-slate-400 tracking-wide truncate max-w-[65%]">
            {getLocalizedText(match.round, match.round_bn)}
          </span>

          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30 text-xs animate-live-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>
                {t.status[match.status]} • {formatNumber(match.current_minute)}&apos;
              </span>
            </span>
          ) : isFinished ? (
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
              {t.status.full_time}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              {formattedDate} • {formattedTime}
            </span>
          )}
        </div>

        {/* Teams & Scoreboard Grid */}
        <div className="grid grid-cols-7 items-center gap-2 py-2">
          {/* Home Team */}
          <div className="col-span-3 flex items-center gap-3">
            <div
              className="relative w-12 h-12 rounded-xl p-1.5 flex items-center justify-center border shadow-md flex-shrink-0"
              style={{
                borderColor: `${home.primary_color}40`,
                backgroundColor: `${home.primary_color}15`,
              }}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src={home.logo_url}
                  alt={home.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                {getLocalizedText(home.name, home.name_bn)}
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                {home.short_name}
              </p>
            </div>
          </div>

          {/* Central Score / VS */}
          <div className="col-span-1 text-center">
            {isLive || isFinished ? (
              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                <span
                  className={`font-mono text-lg sm:text-xl font-black ${
                    isLive ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {formatNumber(match.home_score)} - {formatNumber(match.away_score)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-black text-slate-500 tracking-wider">
                VS
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="col-span-3 flex items-center justify-end gap-3 text-right">
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                {getLocalizedText(away.name, away.name_bn)}
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                {away.short_name}
              </p>
            </div>
            <div
              className="relative w-12 h-12 rounded-xl p-1.5 flex items-center justify-center border shadow-md flex-shrink-0"
              style={{
                borderColor: `${away.primary_color}40`,
                backgroundColor: `${away.primary_color}15`,
              }}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src={away.logo_url}
                  alt={away.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Venue & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{getLocalizedText(match.venue, match.venue_bn)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPosterOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
              title={t.match.generatePoster}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <Link
              href={`/match/${match.id}`}
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>{t.common.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Matchday Poster Modal */}
      <MatchPosterModal
        match={match}
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
      />
    </>
  );
}
