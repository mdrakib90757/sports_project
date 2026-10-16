'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Radio } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';
import { MatchCard } from '@/components/MatchCard';
import { Match } from '@/lib/types';
import { Select } from '@/shared/ui/Select';
import { EmptyState } from '@/shared/ui/StateFeedback';

export default function FixturesPage() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { matches, teams } = useTournamentStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Status filter
      if (statusFilter === 'live') {
        const isLive =
          m.status === 'live_first_half' ||
          m.status === 'live_second_half' ||
          m.status === 'half_time' ||
          m.status === 'extra_time' ||
          m.status === 'penalties';
        if (!isLive) return false;
      } else if (statusFilter === 'upcoming') {
        if (m.status !== 'upcoming') return false;
      } else if (statusFilter === 'finished') {
        if (m.status !== 'full_time') return false;
      }

      // Team filter
      if (selectedTeamId !== 'all') {
        if (m.home_team_id !== selectedTeamId && m.away_team_id !== selectedTeamId) {
          return false;
        }
      }

      return true;
    });
  }, [matches, statusFilter, selectedTeamId]);

  // Group filtered matches by formatted date
  const groupedMatches = useMemo(() => {
    const groups: { [dateStr: string]: Match[] } = {};

    filteredMatches.forEach((m) => {
      const d = new Date(m.match_date);
      const dateKey = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(m);
    });

    return groups;
  }, [filteredMatches]);

  const liveMatchesCount = matches.filter((m) =>
    ['live_first_half', 'live_second_half', 'half_time'].includes(m.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.fixtures.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          {t.fixtures.subtitle}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.fixtures.filterAll}
          </button>
          <button
            onClick={() => setStatusFilter('live')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
              statusFilter === 'live'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t.fixtures.filterLive}</span>
            {liveMatchesCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'upcoming'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.fixtures.filterUpcoming}
          </button>
          <button
            onClick={() => setStatusFilter('finished')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              statusFilter === 'finished'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.fixtures.filterFinished}
          </button>
        </div>

        {/* Custom Team Dropdown Filter */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedTeamId}
            onChange={(val) => setSelectedTeamId(val)}
            placeholder={t.fixtures.allTeams}
            options={[
              { value: 'all', label: t.fixtures.allTeams },
              ...teams.map((team) => ({
                value: team.id,
                label: team.name,
                labelBn: team.name_bn,
                avatarUrl: team.logo_url,
              })),
            ]}
          />
        </div>
      </div>

      {/* MATCHES GROUPED BY DATE */}
      {Object.keys(groupedMatches).length === 0 ? (
        <EmptyState
          title="No Matches Found"
          titleBn="কোনো ম্যাচ পাওয়া যায়নি"
          message={t.fixtures.noMatchesFound}
          messageBn="বর্তমান ফিল্টারে কোনো ম্যাচ উপলব্ধ নেই।"
          isBangla={true}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([dateKey, matchList]) => (
            <div key={dateKey} className="space-y-4">
              {/* Date Header Badge */}
              <div className="flex items-center gap-3">
                <span className="h-px bg-slate-800 flex-1" />
                <div className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-black tracking-wider text-slate-300 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{dateKey}</span>
                </div>
                <span className="h-px bg-slate-800 flex-1" />
              </div>

              {/* Match Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchList.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
