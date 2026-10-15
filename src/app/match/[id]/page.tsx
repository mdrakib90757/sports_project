'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Share2,
  Radio,
  Image as ImageIcon,
  Flame,
  Shield,
  Activity,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { TacticalPitch } from '@/components/TacticalPitch';
import { MatchPosterModal } from '@/components/MatchPosterModal';
import { EventType } from '@/lib/types';

function MatchDetailInner() {
  const params = useParams();
  const matchId = params?.id as string;
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { getMatchById } = useTournamentStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'lineups' | 'stats' | 'info'>('timeline');
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const match = getMatchById(matchId);

  if (!match) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Match Not Found</h2>
        <p className="text-slate-400">The requested match ID does not exist or has been removed.</p>
        <Link
          href="/fixtures"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.home.viewFixtures}</span>
        </Link>
      </div>
    );
  }

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
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const events = match.events ?? [];

  // Helper to render event icons
  const renderEventIcon = (type: EventType) => {
    switch (type) {
      case 'goal':
      case 'penalty_goal':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
            ⚽
          </div>
        );
      case 'yellow_card':
        return (
          <div className="w-5 h-7 rounded-sm bg-amber-400 shadow-md border border-amber-500" />
        );
      case 'red_card':
        return (
          <div className="w-5 h-7 rounded-sm bg-red-600 shadow-md border border-red-700" />
        );
      case 'substitution':
        return (
          <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-md">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Top Breadcrumb & Share Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/fixtures"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.nav.fixtures}</span>
        </Link>

        <button
          onClick={() => setIsPosterModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-white text-xs font-bold transition shadow-sm"
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>{t.match.generatePoster}</span>
        </button>
      </div>

      {/* GIANT SCOREBOARD */}
      <section className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border border-slate-700/70 shadow-2xl">
        {/* Dynamic Stadium Ambient Glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${home.primary_color} 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${away.primary_color} 0%, transparent 40%)`,
          }}
        />

        {/* Status Badge & Running Minute */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>{getLocalizedText(match.round, match.round_bn)}</span>
          </div>

          {isLive ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-black text-sm animate-live-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>
                {t.status[match.status]} • {formatNumber(match.current_minute)}&apos;
              </span>
            </div>
          ) : isFinished ? (
            <div className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs uppercase tracking-wider">
              {t.status.full_time}
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
              {formattedDate} • {formattedTime}
            </div>
          )}
        </div>

        {/* Scoreboard Layout */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-7 items-center gap-6 text-center">
          {/* Home Team */}
          <div className="md:col-span-3 flex flex-col items-center space-y-3">
            <Link
              href={`/teams/${home.id}`}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2.5 flex items-center justify-center border shadow-xl hover:scale-105 transition"
              style={{
                borderColor: `${home.primary_color}60`,
                backgroundColor: `${home.primary_color}15`,
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
            </Link>

            <div>
              <Link
                href={`/teams/${home.id}`}
                className="text-xl sm:text-2xl font-black text-white hover:text-emerald-400 transition"
              >
                {getLocalizedText(home.name, home.name_bn)}
              </Link>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {t.teams.manager}: {getLocalizedText(home.coach, home.coach_bn)}
              </p>
            </div>
          </div>

          {/* Central Giant Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
            {isLive || isFinished ? (
              <div className="px-6 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl">
                <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {formatNumber(match.home_score)}{' '}
                  <span className="text-emerald-400">-</span>{' '}
                  {formatNumber(match.away_score)}
                </span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center">
                <span className="text-xl font-black text-amber-400 italic">VS</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="md:col-span-3 flex flex-col items-center space-y-3">
            <Link
              href={`/teams/${away.id}`}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2.5 flex items-center justify-center border shadow-xl hover:scale-105 transition"
              style={{
                borderColor: `${away.primary_color}60`,
                backgroundColor: `${away.primary_color}15`,
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
            </Link>

            <div>
              <Link
                href={`/teams/${away.id}`}
                className="text-xl sm:text-2xl font-black text-white hover:text-emerald-400 transition"
              >
                {getLocalizedText(away.name, away.name_bn)}
              </Link>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {t.teams.manager}: {getLocalizedText(away.coach, away.coach_bn)}
              </p>
            </div>
          </div>
        </div>

        {/* Stadium Info Bar */}
        <div className="relative z-10 mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{getLocalizedText(match.venue, match.venue_bn)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <div className="flex items-center justify-center border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'timeline'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.match.timeline}
        </button>
        <button
          onClick={() => setActiveTab('lineups')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'lineups'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.match.lineups}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'stats'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.match.stats}
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'info'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {t.match.info}
        </button>
      </div>

      {/* TAB CONTENT 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="rounded-2xl glass-card p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{t.match.timeline}</span>
          </h3>

          {events.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No match events recorded yet. Updates will appear in real time once kickoff begins.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6">
              {events.map((evt) => {
                const isHomeEvent = evt.team_id === home.id;
                const player = evt.player;
                const assistPlayer = evt.assist_player;

                return (
                  <div key={evt.id} className="relative group">
                    {/* Circle marker on timeline */}
                    <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center">
                      {renderEventIcon(evt.event_type)}
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-emerald-400">
                            {formatNumber(evt.minute)}&apos;
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${isHomeEvent ? home.primary_color : away.primary_color}25`,
                              color: isHomeEvent ? home.primary_color : away.primary_color,
                            }}
                          >
                            {getLocalizedText(
                              isHomeEvent ? home.name : away.name,
                              isHomeEvent ? home.name_bn : away.name_bn
                            )}
                          </span>
                        </div>

                        <span className="text-xs uppercase font-bold text-slate-400">
                          {evt.event_type.replace('_', ' ')}
                        </span>
                      </div>

                      {player && (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700">
                            <Image
                              src={player.photo_url}
                              alt={player.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {getLocalizedText(player.name, player.name_bn)}
                            </h4>
                            {assistPlayer && (
                              <p className="text-xs text-slate-400">
                                {t.match.assist}: {getLocalizedText(assistPlayer.name, assistPlayer.name_bn)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {evt.description && (
                        <p className="text-xs text-slate-300 mt-2 italic leading-relaxed">
                          &quot;{evt.description}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: LINEUPS & TACTICAL PITCH */}
      {activeTab === 'lineups' && <TacticalPitch match={match} />}

      {/* TAB CONTENT 3: STATS */}
      {activeTab === 'stats' && (
        <div className="rounded-2xl glass-card p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>{t.match.stats}</span>
          </h3>

          <div className="space-y-5 max-w-xl mx-auto">
            {/* Possession */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{formatNumber(54)}%</span>
                <span>{t.match.possession}</span>
                <span>{formatNumber(46)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                <div className="h-full bg-emerald-500" style={{ width: '54%' }} />
                <div className="h-full bg-red-500" style={{ width: '46%' }} />
              </div>
            </div>

            {/* Shots on Target */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{formatNumber(6)}</span>
                <span>{t.match.shotsOnTarget}</span>
                <span>{formatNumber(4)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
                <div className="h-full bg-red-500" style={{ width: '40%' }} />
              </div>
            </div>

            {/* Corners */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{formatNumber(5)}</span>
                <span>{t.match.corners}</span>
                <span>{formatNumber(3)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                <div className="h-full bg-emerald-500" style={{ width: '62%' }} />
                <div className="h-full bg-red-500" style={{ width: '38%' }} />
              </div>
            </div>

            {/* Fouls */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{formatNumber(11)}</span>
                <span>{t.match.fouls}</span>
                <span>{formatNumber(14)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                <div className="h-full bg-emerald-500" style={{ width: '44%' }} />
                <div className="h-full bg-red-500" style={{ width: '56%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: INFO */}
      {activeTab === 'info' && (
        <div className="rounded-2xl glass-card p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>{t.match.info}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                {t.match.venue}
              </span>
              <p className="font-bold text-white">
                {getLocalizedText(match.venue, match.venue_bn)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                {t.match.date}
              </span>
              <p className="font-bold text-white">
                {formattedDate} • {formattedTime}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                {t.match.referee}
              </span>
              <p className="font-bold text-white">Jashim Uddin (FIFA Badge)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Broadcast & Tracking
              </span>
              <p className="font-bold text-emerald-400">
                Supabase Realtime Live WebSockets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Poster Modal */}
      <MatchPosterModal
        match={match}
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading match center...</p>
        </div>
      }
    >
      <MatchDetailInner />
    </React.Suspense>
  );
}
