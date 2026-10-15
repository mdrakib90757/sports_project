'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';
import { computeStandings } from '@/lib/data/statsUtils';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { StandingsRow } from '@/lib/types';

interface StandingsTableProps {
  compact?: boolean;
  initialTab?: 'groupA' | 'groupB' | 'overall';
}

export function StandingsTable({ compact = false, initialTab = 'groupA' }: StandingsTableProps) {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { teams, matches } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<'groupA' | 'groupB' | 'overall'>(initialTab);

  const standings = computeStandings(teams, matches);

  const currentRows: StandingsRow[] =
    activeTab === 'groupA'
      ? standings.groupA
      : activeTab === 'groupB'
      ? standings.groupB
      : standings.overall;

  return (
    <div className="w-full rounded-2xl glass-card overflow-hidden">
      {/* Group Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 p-3 sm:p-4 bg-slate-900/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('groupA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'groupA'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.standings.groupA}
          </button>
          <button
            onClick={() => setActiveTab('groupB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'groupB'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.standings.groupB}
          </button>
          {!compact && (
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'overall'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.standings.overall}
            </button>
          )}
        </div>

        {compact && (
          <Link
            href="/standings"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            {t.home.viewFullStandings} &rarr;
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 sm:px-4 text-center w-10">{t.standings.rank}</th>
              <th className="py-3 px-3 sm:px-4">{t.standings.team}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.standings.played}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.standings.won}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.standings.drawn}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.standings.lost}</th>
              {!compact && (
                <>
                  <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">
                    {t.standings.gf}
                  </th>
                  <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">
                    {t.standings.ga}
                  </th>
                </>
              )}
              <th className="py-3 px-2 sm:px-3 text-center">{t.standings.gd}</th>
              <th className="py-3 px-3 sm:px-4 text-center font-bold text-white">
                {t.standings.points}
              </th>
              {!compact && (
                <th className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">
                  {t.standings.form}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {currentRows.map((row, index) => {
              const isQualified = activeTab !== 'overall' && index < 2;

              return (
                <tr
                  key={row.team.id}
                  className="hover:bg-slate-800/40 transition group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-3 sm:px-4 text-center font-semibold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        isQualified
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatNumber(index + 1)}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <Link
                      href={`/teams/${row.team.id}`}
                      className="flex items-center gap-2.5 sm:gap-3 group-hover:text-emerald-400 transition"
                    >
                      <div
                        className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-1 flex items-center justify-center border flex-shrink-0"
                        style={{
                          borderColor: `${row.team.primary_color}40`,
                          backgroundColor: `${row.team.primary_color}15`,
                        }}
                      >
                        <div className="relative w-full h-full rounded overflow-hidden">
                          <Image
                            src={row.team.logo_url}
                            alt={row.team.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <span className="font-bold text-white truncate max-w-[130px] sm:max-w-none">
                        {getLocalizedText(row.team.name, row.team.name_bn)}
                      </span>
                    </Link>
                  </td>

                  {/* Stats */}
                  <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-mono">
                    {formatNumber(row.played)}
                  </td>
                  <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-mono">
                    {formatNumber(row.won)}
                  </td>
                  <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-mono">
                    {formatNumber(row.drawn)}
                  </td>
                  <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-mono">
                    {formatNumber(row.lost)}
                  </td>
                  {!compact && (
                    <>
                      <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400 font-mono hidden md:table-cell">
                        {formatNumber(row.gf)}
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400 font-mono hidden md:table-cell">
                        {formatNumber(row.ga)}
                      </td>
                    </>
                  )}
                  <td className="py-3.5 px-2 sm:px-3 text-center font-mono font-medium text-slate-300">
                    {row.gd > 0 ? `+${formatNumber(row.gd)}` : formatNumber(row.gd)}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center font-black font-mono text-base text-emerald-400">
                    {formatNumber(row.points)}
                  </td>

                  {/* Form Badges */}
                  {!compact && (
                    <td className="py-3.5 px-3 sm:px-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length === 0 ? (
                          <span className="text-slate-600">-</span>
                        ) : (
                          row.form.map((f, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white ${
                                f === 'W'
                                  ? 'bg-emerald-600'
                                  : f === 'D'
                                  ? 'bg-amber-600'
                                  : 'bg-red-600'
                              }`}
                            >
                              {f}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-3 sm:p-4 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        <span>{t.standings.qualificationRule}</span>
      </div>
    </div>
  );
}
