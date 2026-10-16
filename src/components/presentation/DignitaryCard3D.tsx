'use client';

import React from 'react';
import Image from 'next/image';
import { Dignitary } from '@/lib/types';
import { Award, Shield, Quote, Sparkles, Building2, UserCheck } from 'lucide-react';

interface DignitaryCard3DProps {
  dignitary: Dignitary;
  language?: 'bn' | 'en';
  currentIndex: number;
  totalCount: number;
}

export const DignitaryCard3D: React.FC<DignitaryCard3DProps> = ({
  dignitary,
  language = 'bn',
  currentIndex,
  totalCount,
}) => {
  const isBn = language === 'bn';
  const roleColor = dignitary.team_color || '#10b981';

  return (
    <div className="relative w-full max-w-xl group">
      {/* Dynamic Ambient Neon Glow Behind Card */}
      <div
        style={{ backgroundColor: roleColor }}
        className="absolute -inset-1 rounded-3xl opacity-30 blur-2xl group-hover:opacity-50 transition-all duration-700 pointer-events-none"
      />

      {/* Main 3D Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500 hover:border-slate-500">
        
        {/* Hologram Card Header Strip */}
        <div className="relative h-28 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          {/* Subtle decorative grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
          
          {/* Category & Badge */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${roleColor}25`, borderColor: roleColor, color: roleColor }}
              className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isBn ? dignitary.badge_bn : dignitary.badge}</span>
            </div>
            
            {dignitary.team_name && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {isBn ? dignitary.team_name_bn : dignitary.team_name}
              </span>
            )}
          </div>

          {/* Sequence Counter Index (e.g. 01 / 13) */}
          <div className="relative z-10 flex items-center gap-1 font-mono text-xs text-slate-400">
            <span className="text-[#C6FF3D] font-bold text-sm">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span>/</span>
            <span>{String(totalCount).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* VIP Portrait Photo with Illuminated Frame */}
            <div className="relative flex-shrink-0">
              {/* Outer Neon Glow Circle */}
              <div
                style={{ borderColor: roleColor }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl p-1 border-2 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden bg-slate-950"
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={dignitary.photo_url}
                    alt={dignitary.name}
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>

              {/* Team Crest or VIP Star overlay pill */}
              {dignitary.team_logo_url ? (
                <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-xl bg-slate-950 border-2 border-slate-700 shadow-xl overflow-hidden p-0.5">
                  <Image
                    src={dignitary.team_logo_url}
                    alt="Team Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
              )}
            </div>

            {/* Dignitary Name & Credentials */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>{isBn ? dignitary.name_bn : dignitary.name}</span>
                  <UserCheck className="w-5 h-5 text-[#C6FF3D]" />
                </h2>
                <p className="text-sm sm:text-base font-semibold text-emerald-400 mt-0.5">
                  {isBn ? dignitary.role_bn : dignitary.role}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {isBn ? dignitary.name : dignitary.name_bn}
                </p>
              </div>

              {/* Key Credentials Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                {(isBn ? dignitary.highlights_bn : dignitary.highlights_en).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    <Shield className="w-3 h-3 text-[#C6FF3D]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

            {/* Official Message Quote Box */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 relative">
            <Quote className="w-6 h-6 text-[#C6FF3D]/40 absolute top-3 left-3 -scale-x-100" />
            <div className="pl-7 pr-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isBn ? 'অফিসিয়াল বাণী / বার্তা' : 'Official Message'}
              </span>
              <p className="text-sm sm:text-base text-slate-300 italic font-sans leading-relaxed">
                &ldquo;{isBn ? dignitary.message_bn : dignitary.message_en}&rdquo;
              </p>
            </div>
          </div>

          {/* Affiliation footer row */}
          {dignitary.team_name && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColor }} />
                <span>{isBn ? 'টিম নেতৃত্ব' : 'Team Leadership'}:</span>
                <strong className="text-slate-200">{isBn ? dignitary.team_name_bn : dignitary.team_name}</strong>
              </span>
              <span className="text-[#C6FF3D] font-medium">কচনাপুর প্রিমিয়ার লিগ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
