'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { useLanguage } from './LanguageContext';
import Image from 'next/image';

export function LiveGoalPopup() {
  const { activeGoalAlert, dismissGoalAlert } = useTournamentStore();
  const { getLocalizedText, formatNumber, t } = useLanguage();

  if (!activeGoalAlert) return null;

  const { team, player, minute, homeScore, awayScore } = activeGoalAlert;

  return (
    <AnimatePresence>
      <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-2xl border border-emerald-500/30 backdrop-blur-xl bg-slate-900/95"
          style={{
            boxShadow: `0 20px 40px -10px ${team.primary_color}40, 0 0 20px rgba(16, 185, 129, 0.2)`,
          }}
        >
          {/* Glowing top line with team color */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: team.primary_color }}
          />

          <button
            onClick={dismissGoalAlert}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {t.match.goals} ! • {formatNumber(minute)}&apos;
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0">
              <Image
                src={player.photo_url}
                alt={player.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 truncate">
                {getLocalizedText(team.name, team.name_bn)}
              </p>
              <h4 className="text-lg font-bold text-white leading-tight truncate">
                {getLocalizedText(player.name, player.name_bn)}
              </h4>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                #{formatNumber(player.jersey_number)} • {player.position}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {formatNumber(homeScore)} - {formatNumber(awayScore)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
