'use client';

import React from 'react';
import { Trophy, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { StandingsTable } from '@/components/StandingsTable';

export default function StandingsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Calculated Live from Match Results</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.standings.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          {t.standings.subtitle}
        </p>
      </div>

      {/* Standings Table with Full Details */}
      <StandingsTable compact={false} />

      {/* Rules & Information Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl glass-card space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Points Allocation
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            3 points awarded for a victory, 1 point for a drawn match, and 0 points for a defeat.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Tie-Breaking Criteria
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            1. Total Points &rarr; 2. Goal Difference (GD) &rarr; 3. Goals For (GF) &rarr; 4. Head-to-Head record.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Knockout Pathway
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The top 2 clubs from Group A and Group B advance directly to the Quarter-Finals and Semi-Finals.
          </p>
        </div>
      </div>
    </div>
  );
}
