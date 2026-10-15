'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Flame, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { computeTopScorers } from '@/lib/data/statsUtils';

export default function TopScorersPage() {
  const { language, t, getLocalizedText, formatNumber } = useLanguage();
  const { players, teams, events } = useTournamentStore();

  const topScorers = computeTopScorers(players, teams, events);

  const topThree = topScorers.slice(0, 3);
  const remainingScorers = topScorers.slice(3);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>{language === 'bn' ? 'কচনাপুর প্রিমিয়ার লিগ সিজন ৩ সম্মাননা' : 'Kochnapur Premier League Season 3 Honors'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.stats.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          {t.stats.subtitle}
        </p>
      </div>

      {/* TOP 3 PODIUM SHOWCASE */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 rounded-2xl glass-card p-6 border-slate-400/30 text-center relative overflow-hidden group hover:border-slate-300 transition">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300" />
            <div className="w-8 h-8 mx-auto rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg mb-3">
              2
            </div>
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-300 shadow-xl mb-3">
              <Image
                src={topThree[1].player.photo_url}
                alt={topThree[1].player.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <h3 className="text-base font-bold text-white truncate">
              {getLocalizedText(topThree[1].player.name, topThree[1].player.name_bn)}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {getLocalizedText(topThree[1].team.name, topThree[1].team.name_bn)}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center gap-4 text-xs">
              <div>
                <span className="font-mono text-xl font-black text-white">
                  {formatNumber(topThree[1].goals)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.goals}
                </span>
              </div>
              <div>
                <span className="font-mono text-xl font-black text-slate-300">
                  {formatNumber(topThree[1].assists)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.assists}
                </span>
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div className="order-1 md:order-2 rounded-3xl glass-card p-8 border-amber-400/40 text-center relative overflow-hidden group shadow-2xl shadow-amber-500/10 md:-translate-y-4 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-300" />
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center shadow-lg mb-3">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl mb-3">
              <Image
                src={topThree[0].player.photo_url}
                alt={topThree[0].player.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black tracking-wider uppercase mb-1">
              GOLDEN BOOT LEADER
            </div>
            <h3 className="text-xl font-black text-white truncate">
              {getLocalizedText(topThree[0].player.name, topThree[0].player.name_bn)}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {getLocalizedText(topThree[0].team.name, topThree[0].team.name_bn)}
            </p>
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-center gap-6 text-xs">
              <div>
                <span className="font-mono text-3xl font-black text-emerald-400">
                  {formatNumber(topThree[0].goals)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.goals}
                </span>
              </div>
              <div>
                <span className="font-mono text-3xl font-black text-cyan-400">
                  {formatNumber(topThree[0].assists)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.assists}
                </span>
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 rounded-2xl glass-card p-6 border-amber-700/30 text-center relative overflow-hidden group hover:border-amber-600 transition">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700" />
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg mb-3">
              3
            </div>
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-700 shadow-xl mb-3">
              <Image
                src={topThree[2].player.photo_url}
                alt={topThree[2].player.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <h3 className="text-base font-bold text-white truncate">
              {getLocalizedText(topThree[2].player.name, topThree[2].player.name_bn)}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {getLocalizedText(topThree[2].team.name, topThree[2].team.name_bn)}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center gap-4 text-xs">
              <div>
                <span className="font-mono text-xl font-black text-white">
                  {formatNumber(topThree[2].goals)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.goals}
                </span>
              </div>
              <div>
                <span className="font-mono text-xl font-black text-slate-300">
                  {formatNumber(topThree[2].assists)}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t.stats.assists}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Complete Scorers Ranking</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4 text-center w-12">{t.stats.rank}</th>
                <th className="py-3 px-3 sm:px-4">{t.stats.player}</th>
                <th className="py-3 px-3 sm:px-4">{t.stats.club}</th>
                <th className="py-3 px-3 text-center font-bold text-white">{t.stats.goals}</th>
                <th className="py-3 px-3 text-center">{t.stats.assists}</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">{t.stats.matches}</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">{t.stats.goalsPerGame}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topScorers.map((row) => (
                <tr key={row.player.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-bold text-slate-400">
                    {formatNumber(row.rank)}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                        <Image
                          src={row.player.photo_url}
                          alt={row.player.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">
                          {getLocalizedText(row.player.name, row.player.name_bn)}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{formatNumber(row.player.jersey_number)} • {row.player.position}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4">
                    <Link
                      href={`/teams/${row.team.id}`}
                      className="flex items-center gap-2 hover:text-emerald-400 transition"
                    >
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-700 flex-shrink-0">
                        <Image
                          src={row.team.logo_url}
                          alt={row.team.name}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-slate-300 truncate max-w-[140px] sm:max-w-none">
                        {getLocalizedText(row.team.name, row.team.name_bn)}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-black text-emerald-400 text-base">
                    {formatNumber(row.goals)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                    {formatNumber(row.assists)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                    {formatNumber(row.matches)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden md:table-cell">
                    {(row.goals / (row.matches || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
