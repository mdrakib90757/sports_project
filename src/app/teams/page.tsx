'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Shield, Users } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';

export default function TeamsPage() {
  const { t, getLocalizedText, formatNumber } = useLanguage();
  const { teams, players } = useTournamentStore();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.teams.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          {t.teams.subtitle}
        </p>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map((team) => {
          const squadCount = players.filter((p) => p.team_id === team.id).length;

          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group relative rounded-2xl overflow-hidden glass-card glass-card-hover p-6 flex flex-col justify-between transition-all"
            >
              {/* Team color accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.primary_color }}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {team.group_name}
                  </span>
                  <div className="flex gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                      style={{ backgroundColor: team.primary_color }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                      style={{ backgroundColor: team.secondary_color }}
                    />
                  </div>
                </div>

                {/* Team Crest */}
                <div className="flex justify-center py-2">
                  <div
                    className="relative w-20 h-20 rounded-2xl p-2 flex items-center justify-center border shadow-xl group-hover:scale-105 transition transform"
                    style={{
                      borderColor: `${team.primary_color}50`,
                      backgroundColor: `${team.primary_color}15`,
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={team.logo_url}
                        alt={team.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Name & Details */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition leading-tight">
                    {getLocalizedText(team.name, team.name_bn)}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{getLocalizedText(team.city, team.city_bn)}</span>
                  </p>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {formatNumber(squadCount)} {t.teams.playersCount}
                  </span>
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>{t.teams.viewSquad}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
