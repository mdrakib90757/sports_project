'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Calendar, MapPin, Trophy, Sparkles } from 'lucide-react';
import { Match, Team } from '@/lib/types';
import { useLanguage } from './LanguageContext';
import Image from 'next/image';

interface MatchPosterModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchPosterModal({ match, isOpen, onClose }: MatchPosterModalProps) {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const home = match.home_team;
  const away = match.away_team;

  if (!home || !away) return null;

  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution rendering
      });

      const link = document.createElement('a');
      link.download = `matchday-${home.short_name}-vs-${away.short_name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t.match.posterModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POSTER CANVAS TO CAPTURE */}
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-slate-700/50">
          <div
            ref={posterRef}
            className="relative w-full aspect-[4/5] bg-slate-950 flex flex-col justify-between p-6 sm:p-8 text-white overflow-hidden select-none"
            style={{
              background: `radial-gradient(circle at 15% 20%, ${home.primary_color}35 0%, transparent 45%), radial-gradient(circle at 85% 80%, ${away.primary_color}35 0%, transparent 45%), linear-gradient(180deg, #090d16 0%, #030712 100%)`,
            }}
          >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Stadium Lights Beam Effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl pointer-events-none" />

            {/* Top Bar: Tournament & Matchday */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase text-white">
                    {t.tournament.name}
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-semibold tracking-wider">
                    {getLocalizedText(match.round, match.round_bn)}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-black tracking-widest uppercase text-amber-300">
                MATCHDAY
              </div>
            </div>

            {/* Middle: Teams Clash Graphic */}
            <div className="relative z-10 my-auto py-6">
              <div className="grid grid-cols-2 gap-4 items-center relative">
                {/* Home Team */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2.5 flex items-center justify-center shadow-2xl transition transform"
                    style={{
                      background: `linear-gradient(135deg, ${home.primary_color}25, rgba(15, 23, 42, 0.8))`,
                      border: `2px solid ${home.primary_color}80`,
                      boxShadow: `0 10px 25px -5px ${home.primary_color}50`,
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={home.logo_url}
                        alt={home.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                      {getLocalizedText(home.name, home.name_bn)}
                    </h2>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">
                      {home.city}
                    </span>
                  </div>
                </div>

                {/* VS Badge in Center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/30 border-2 border-slate-900 font-black text-slate-950 text-sm sm:text-base italic">
                    VS
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2.5 flex items-center justify-center shadow-2xl transition transform"
                    style={{
                      background: `linear-gradient(135deg, ${away.primary_color}25, rgba(15, 23, 42, 0.8))`,
                      border: `2px solid ${away.primary_color}80`,
                      boxShadow: `0 10px 25px -5px ${away.primary_color}50`,
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={away.logo_url}
                        alt={away.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                      {getLocalizedText(away.name, away.name_bn)}
                    </h2>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">
                      {away.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Preview if in progress or finished */}
              {(match.status.startsWith('live') || match.status === 'full_time') && (
                <div className="mt-6 text-center">
                  <div className="inline-block px-5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-400">
                      {formatNumber(match.home_score)} - {formatNumber(match.away_score)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom: Kickoff Info & Venue */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {formattedDate} • {formattedTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[220px]">
                    {getLocalizedText(match.venue, match.venue_bn)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                <span>#KochnapurPremierLeagueS3</span>
                <span>kpl-season3.live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? t.match.downloading : t.match.downloadPoster}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            {t.match.close}
          </button>
        </div>
      </div>
    </div>
  );
}
