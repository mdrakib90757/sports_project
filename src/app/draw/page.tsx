'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Undo2,
  Play,
  Users,
  Shield,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';
import { useDraw } from '@/features/draw/hooks/useDraw';
import { useLanguage } from '@/components/LanguageContext';
import { Player, Team } from '@/lib/types';

export default function DrawPage() {
  const { language, t, getLocalizedText, formatNumber } = useLanguage();
  const {
    state,
    isLoading,
    isDrawing,
    revealedPlayer,
    revealedTeam,
    soundEnabled,
    toggleSound,
    startSession,
    isStarting,
    nextPick,
    isPicking,
    undoLastPick,
    isUndoing,
    resetSession,
    isResetting,
  } = useDraw();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stage' | 'roster' | 'pool'>('stage');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const session = state?.session;
  const currentTurn = state?.currentTurn;
  const remainingPool = state?.remainingPool || [];
  const teams = state?.teams || [];
  const picks = state?.picks || [];

  const isSessionActive = session?.status === 'active';
  const isCompleted = session?.status === 'completed' || (isSessionActive && remainingPool.length === 0);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isFullscreen ? 'p-4 sm:p-6' : 'pb-16'}`}>
      {/* Broadcast Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-lime-400/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {language === 'bn' ? 'কেপিএল ৩ — অফিসিয়াল লাইভ ড্র' : 'KPL 3 — Official Live Draw'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lime-400/15 text-lime-400 border border-lime-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                {session?.isPractice ? (language === 'bn' ? 'প্র্যাকটিস' : 'PRACTICE') : (language === 'bn' ? 'লাইভ ড্র' : 'LIVE DRAW')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? `লেভেল: ${session?.currentLevel || 'A'} | রাউন্ড: ${formatNumber(session?.currentRound || 1)} | মোট পিক: ${formatNumber(picks.length)}`
                : `Level: ${session?.currentLevel || 'A'} | Round: ${session?.currentRound || 1} | Total Picks: ${picks.length}`}
            </p>
          </div>
        </div>

        {/* Top Action Tools */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-lime-400 hover:bg-slate-800'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Presenter Mode */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="ফুলস্ক্রিন প্রজেক্টর মোড"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Broadcast Stage Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-between py-6">
        {/* Stage Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Current Turn & Spotlight (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                {language === 'bn' ? 'চলমান টার্ন' : 'Current Turn'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                {language === 'bn' ? `লেভেল ${session?.currentLevel || 'A'}` : `Level ${session?.currentLevel || 'A'}`}
              </span>
            </div>

            {currentTurn ? (
              <div className="mt-4 flex flex-col items-center text-center">
                {/* Team Crest Spotlight */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border-2 border-lime-400/60 p-2 flex items-center justify-center shadow-lg shadow-lime-400/10 relative z-10">
                    <img
                      src={currentTurn.team.logo_url}
                      alt={currentTurn.team.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-lime-400/20 rounded-2xl blur-xl animate-pulse" />
                </div>

                <h3 className="mt-4 text-xl font-black text-white">
                  {getLocalizedText(currentTurn.team.name, currentTurn.team.name_bn)}
                </h3>
                <span className="text-xs text-slate-400 mt-0.5">
                  {currentTurn.team.short_name} • {currentTurn.team.group_name}
                </span>

                {/* Captain & Team Info */}
                {(() => {
                  const activeTeam: any = teams.find((t) => t.id === currentTurn.team.id) || currentTurn.team;
                  const captain = activeTeam?.captainPlayer || activeTeam?.squad?.find((p: any) => p.is_captain || p.isCaptain);
                  const captainPhoto = captain?.photo_url || captain?.photoUrl;
                  const captainName = captain
                    ? getLocalizedText(captain.name, captain.name_bn || captain.nameBn)
                    : activeTeam?.coach || (language === 'bn' ? 'নির্ধারিত ক্যাপ্টেন' : 'Designated Captain');

                  return (
                    <div className="w-full mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-400 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                        {captainPhoto ? (
                          <img
                            src={captainPhoto}
                            alt={captainName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <Users className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{language === 'bn' ? 'অধিনায়ক (Captain)' : 'Team Captain'}</span>
                        </div>
                        <div className="text-sm font-black text-white truncate mt-0.5">
                          {captainName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <img src={currentTurn.team.logo_url} alt="" className="w-3.5 h-3.5 object-contain" />
                          <span className="truncate">{getLocalizedText(currentTurn.team.name, currentTurn.team.name_bn)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Squad Counter */}
                <div className="w-full mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">{language === 'bn' ? 'দলগত খেলোয়াড়' : 'Squad Size'}</div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {formatNumber(teams.find((t) => t.id === currentTurn.team.id)?.squad?.length || 0)}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">{language === 'bn' ? 'লেভেলে বাকি' : 'In Level Pool'}</div>
                    <div className="text-sm font-black text-lime-400 mt-0.5">
                      {formatNumber(remainingPool.length)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 py-8 flex flex-col items-center text-center text-slate-400">
                <Trophy className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-300">
                  {isCompleted
                    ? (language === 'bn' ? 'ড্র সফলভাবে সম্পন্ন হয়েছে!' : 'Draw successfully completed!')
                    : (language === 'bn' ? 'ড্র শুরু করতে নিচের স্টার্ট বাটনে চাপুন' : 'Click start to begin the draw session')}
                </p>
              </div>
            )}
          </div>

          {/* CENTER: 3D Stage & Reveal Mystery Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[420px] bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            {/* Ambient Stage Spotlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-lime-500/20 via-transparent to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              {isDrawing ? (
                /* Suspense Card Shuffling Motion */
                <motion.div
                  key="shuffling"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [0.95, 1.05, 0.98, 1.02],
                    rotate: [-3, 3, -2, 2, 0],
                    opacity: 1,
                  }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-64 h-88 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-lime-400 shadow-2xl shadow-lime-400/30 flex flex-col items-center justify-center p-6 text-center"
                >
                  <Sparkles className="w-12 h-12 text-lime-400 animate-spin mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-lime-400 animate-pulse">
                    {language === 'bn' ? 'ড্র চলছে...' : 'DRAWING...'}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    {language === 'bn' ? 'খেলোয়াড় নির্বাচন হচ্ছে' : 'Selecting player from pool'}
                  </p>
                </motion.div>
              ) : revealedPlayer ? (
                /* Dramatic Revealed Player Card */
                <motion.div
                  key={revealedPlayer.id}
                  initial={{ rotateY: 90, scale: 0.7, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                  className="w-72 sm:w-80 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-lime-400 shadow-2xl shadow-lime-400/30 p-5 flex flex-col items-center text-center relative"
                >
                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-lime-400 text-slate-950">
                      LEVEL {revealedPlayer.level || 'A'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {revealedPlayer.position}
                    </span>
                  </div>

                  {/* Player Photo */}
                  <div className="relative mt-3">
                    <div className="w-28 h-28 rounded-full border-4 border-lime-400/80 overflow-hidden bg-slate-800 shadow-xl">
                      <img
                        src={revealedPlayer.photo_url}
                        alt={revealedPlayer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-lime-400 text-lime-400 flex items-center justify-center font-black text-xs shadow-md">
                      #{formatNumber(revealedPlayer.jersey_number)}
                    </div>
                  </div>

                  {/* Player Name */}
                  <h2 className="mt-3 text-lg sm:text-xl font-black text-white">
                    {getLocalizedText(revealedPlayer.name, revealedPlayer.name_bn)}
                  </h2>
                  <p className="text-xs text-slate-400">{revealedPlayer.nationality}</p>

                  {/* Draft Destination Team Banner */}
                  {revealedTeam && (
                    <div className="w-full mt-4 p-2.5 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center gap-2">
                      <img
                        src={revealedTeam.logo_url}
                        alt={revealedTeam.name}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-xs font-bold text-lime-400">
                        {language === 'bn' ? 'ড্র হয়েছে:' : 'Drafted to:'}{' '}
                        {getLocalizedText(revealedTeam.name, revealedTeam.name_bn)}
                      </span>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Idle Mystery Card */
                <motion.div
                  key="idle-card"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="w-64 h-84 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-lime-400/60 transition-colors group"
                  onClick={() => {
                    if (isSessionActive && !isDrawing) nextPick();
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    {language === 'bn' ? 'কেপিএল লটারি ড্র' : 'KPL Lottery Draw'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
                    {isSessionActive
                      ? (language === 'bn' ? 'পরবর্তী পিক করতে নিচের বাটনে চাপুন' : 'Click Next Pick below to draw')
                      : (language === 'bn' ? 'ড্র সেশন এখনো শুরু হয়নি' : 'Draw session not active')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Live Drafted Feed / Recents (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'bn' ? 'সর্বশেষ বাছাই' : 'Recent Picks'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {formatNumber(picks.length)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 custom-scrollbar">
              {picks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  {language === 'bn' ? 'এখনো কোনো খেলোয়াড় ড্র করা হয়নি' : 'No players drafted yet'}
                </div>
              ) : (
                picks
                  .slice()
                  .reverse()
                  .map((pick, i) => {
                    const player = teams
                      .flatMap((t) => t.squad || [])
                      .find((p) => p.id === pick.playerId);
                    const team = teams.find((t) => t.id === pick.teamId);

                    return (
                      <div
                        key={pick.id || i}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {team && (
                            <img
                              src={team.logo_url}
                              alt={team.name}
                              className="w-5 h-5 object-contain shrink-0"
                            />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-200">
                              {player ? getLocalizedText(player.name, player.name_bn) : pick.playerId}
                            </span>
                            <div className="text-[10px] text-slate-400 truncate">
                              {team ? getLocalizedText(team.name, team.name_bn) : ''}
                            </div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-lime-400 shrink-0">
                          {pick.level}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: Remote Control Panel */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {!isSessionActive ? (
              <button
                onClick={() => startSession(false)}
                disabled={isStarting}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{language === 'bn' ? 'ড্র সেশন শুরু করুন' : 'Start Draw Session'}</span>
              </button>
            ) : (
              <button
                onClick={nextPick}
                disabled={isPicking || remainingPool.length === 0}
                className="h-12 px-8 rounded-xl bg-lime-400 text-slate-950 font-black text-base flex items-center gap-2.5 shadow-xl shadow-lime-400/25 hover:bg-lime-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {isDrawing
                    ? (language === 'bn' ? 'বাছাই চলছে...' : 'Drawing...')
                    : (language === 'bn' ? 'পরবর্তী খেলোয়াড় ড্র করুন' : 'Next Pick')}
                </span>
              </button>
            )}

            {isSessionActive && (
              <button
                onClick={undoLastPick}
                disabled={isUndoing || picks.length === 0}
                className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-40"
                title="সর্বশেষ পিক বাতিল করুন"
              >
                <Undo2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'bn' ? 'আগের পিক বাতিল' : 'Undo Pick'}
                </span>
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(language === 'bn' ? 'আপনি কি ড্র সেশন রিসেট করতে চান?' : 'Are you sure you want to reset the draw session?')) {
                  resetSession();
                }
              }}
              disabled={isResetting || picks.length === 0}
              className="h-9 px-3 rounded-lg bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-semibold border border-slate-700/80 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>

            <Link
              href="/teams"
              className="h-9 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'দলসমূহ দেখুন' : 'View Teams'}</span>
            </Link>
          </div>
        </div>

        {/* BOTTOM ROSTERS ACCORDION / GRID */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              {language === 'bn' ? 'সকল দলের রোস্টার ও ড্র ফলাফল' : 'All Teams Rosters & Draft Status'}
            </h3>
            <span className="text-xs text-slate-400">
              {formatNumber(teams.length)} {language === 'bn' ? 'টি দল' : 'Teams'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white truncate">
                        {getLocalizedText(team.name, team.name_bn)}
                      </div>
                      <div className="text-[10px] text-slate-400">{team.group_name}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">
                      {formatNumber(team.squad?.length || 0)}
                    </span>
                  </div>

                  {/* Mini squad list */}
                  <div className="mt-2.5 space-y-1">
                    {team.squad && team.squad.length > 0 ? (
                      team.squad.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="text-[11px] text-slate-300 flex items-center justify-between py-0.5"
                        >
                          <span className="truncate">
                            {p.is_captain && <span className="text-amber-400 font-bold mr-1">(C)</span>}
                            {getLocalizedText(p.name, p.name_bn)}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase">{p.position}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-500 py-1 italic">
                        {language === 'bn' ? 'কোনো খেলোয়াড় নেই' : 'No players drafted yet'}
                      </div>
                    )}
                    {team.squad && team.squad.length > 4 && (
                      <div className="text-[10px] text-lime-400 font-semibold pt-1">
                        +{formatNumber(team.squad.length - 4)} {language === 'bn' ? 'জন আরও' : 'more'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{language === 'bn' ? 'কোচ/ক্যাপ্টেন:' : 'Coach/Captain:'}</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[120px]">{team.coach}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
