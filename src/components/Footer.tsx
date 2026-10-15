'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';

export function Footer() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { tournament } = useTournamentStore();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tournament Overview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {getLocalizedText(tournament.name, tournament.name_bn)}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" />
                Supabase Realtime
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                PostgreSQL RLS
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t.fixtures.title}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-emerald-400 transition">
                  {t.nav.fixtures}
                </Link>
              </li>
              <li>
                <Link href="/standings" className="hover:text-emerald-400 transition">
                  {t.nav.standings}
                </Link>
              </li>
              <li>
                <Link href="/bracket" className="hover:text-emerald-400 transition">
                  {t.nav.bracket}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tournament Hub */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t.teams.title}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teams" className="hover:text-emerald-400 transition">
                  {t.teams.title}
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-emerald-400 transition">
                  {t.nav.topScorers}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-amber-400 hover:text-amber-300 font-medium transition">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {formatNumber(2026)} {getLocalizedText(tournament.name, tournament.name_bn)}. {t.common.allRightsReserved}
          </p>
          <p className="flex items-center gap-1">
            {t.common.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
}
