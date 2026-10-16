'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { demoDignitaries } from '@/lib/data/dignitariesData';
import { Dignitary } from '@/lib/types';
import { VirtualPresenter3D } from '@/components/presentation/VirtualPresenter3D';
import { DignitaryCard3D } from '@/components/presentation/DignitaryCard3D';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  Tv,
  ArrowLeft,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  Crown,
} from 'lucide-react';

export default function PresentationPage() {
  const { language, formatNumber } = useLanguage();
  const isBn = language === 'bn';

  const [activeCategory, setActiveCategory] = useState<'all' | 'leadership' | 'team' | 'committee'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered list based on category
  const filteredDignitaries = demoDignitaries.filter((d) => {
    if (activeCategory === 'leadership') return d.category === 'league' || d.category === 'tournament';
    if (activeCategory === 'team') return d.category === 'team';
    if (activeCategory === 'committee') return d.category === 'committee';
    return true;
  });

  const currentDignitary: Dignitary = filteredDignitaries[currentIndex] || filteredDignitaries[0];

  // Synthesized Fanfare / Chime via Web Audio API (zero external asset dependency)
  const playFanfare = useCallback(() => {
    if (!soundEffectsEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Chord sequence: F major fanfare
      const notes = [349.23, 440.0, 523.25, 698.46];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.8);
      });
    } catch {
      // AudioContext not allowed before user interaction
    }
  }, [soundEffectsEnabled]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev < filteredDignitaries.length - 1 ? prev + 1 : 0;
      return next;
    });
    playFanfare();
    setAutoPlayProgress(0);
  }, [filteredDignitaries.length, playFanfare]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev > 0 ? prev - 1 : filteredDignitaries.length - 1;
      return next;
    });
    playFanfare();
    setAutoPlayProgress(0);
  }, [filteredDignitaries.length, playFanfare]);

  // Auto-play timer logic
  useEffect(() => {
    if (isAutoPlay) {
      const DURATION = 10000; // 10 seconds per official
      const INTERVAL = 100;
      let elapsed = 0;

      progressTimerRef.current = setInterval(() => {
        elapsed += INTERVAL;
        setAutoPlayProgress(Math.min((elapsed / DURATION) * 100, 100));
      }, INTERVAL);

      autoPlayTimerRef.current = setTimeout(() => {
        handleNext();
      }, DURATION);

      return () => {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };
    } else {
      setAutoPlayProgress(0);
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
  }, [isAutoPlay, currentIndex, handleNext]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsAutoPlay((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#060a12] text-white flex flex-col relative overflow-x-hidden ${
        isFullscreen ? 'p-0' : 'pb-12'
      }`}
    >
      {/* Dynamic Animated Background Grid & Spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Volumetric Stadium Lights */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#C6FF3D]/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Stadium turf floor reflection */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#061e12]/40 to-transparent" />
      </div>

      {/* Top Ceremony Broadcast Control Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Tv className="w-3 h-3" />
              LIVE CEREMONY
            </span>
            <span className="text-xs font-bold text-slate-200 hidden md:inline">
              {isBn ? 'কচনাপুর প্রিমিয়ার লিগ — টুর্নামেন্ট ও টিম নেতৃত্ব পরিচিতি' : 'KPL — Tournament & Team VIP Showcase'}
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'all', labelBn: 'সকল অতিথি', labelEn: 'All VIPs' },
            { id: 'leadership', labelBn: 'লীগ ও টুর্নামেন্ট শীর্ষ', labelEn: 'Leadership' },
            { id: 'team', labelBn: 'টিম প্রেসিডেন্টবৃন্দ', labelEn: 'Team Presidents' },
            { id: 'committee', labelBn: 'অর্গানাইজিং কমিটি', labelEn: 'Committee' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as 'all' | 'leadership' | 'team' | 'committee');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-[#C6FF3D] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBn ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Actions: Sound, Drawer, Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEffectsEnabled ? 'ফ্যানফেয়ার সাউন্ড অফ' : 'ফ্যানফেয়ার সাউন্ড অন'}
          >
            {soundEffectsEnabled ? <Volume2 className="w-4 h-4 text-[#C6FF3D]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#C6FF3D]/50 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#C6FF3D]" />
            <span className="hidden sm:inline">{isBn ? 'অতিথি সূচী' : 'VIP List'}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-lime-400 font-mono">
              {formatNumber(filteredDignitaries.length)}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] hover:bg-[#C6FF3D]/20 transition-all"
            title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ' : 'ফুলস্ক্রিন প্রজেক্টর মোড'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Auto-Play Countdown Progress Bar */}
      {isAutoPlay && (
        <div className="w-full h-1 bg-slate-800">
          <div
            style={{ width: `${autoPlayProgress}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 via-[#C6FF3D] to-amber-400 transition-all duration-100"
          />
        </div>
      )}

      {/* Main Ceremony Showcase Arena */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        
        {/* Stage Title Ribbon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'অফিসিয়াল লিগ ও টুর্নামেন্ট উদ্বোধনী শো' : 'Official League & VIP Opening Showcase'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isBn ? 'টুর্নামেন্ট নেতৃত্ব ও টিম প্রেসিডেন্টবৃন্দ' : 'Tournament Leadership & Team Presidents'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBn
              ? 'কচনাপুর প্রিমিয়ার লিগের সকল সম্মানিত প্রেসিডেন্ট, পরিচালক ও সংগঠকদের আনুষ্ঠানিক পরিচয় পর্ব'
              : 'Official honors & introductions of presidents, organizers, and team management'}
          </p>
        </div>

        {/* Dual 3D Arena: Left 3D Virtual Presenter, Right 3D Dignitary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
          
          {/* Left Column: 3D Virtual Presenter (Avatar + Narration + Live Subtitles) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <VirtualPresenter3D
              speechText={isBn ? currentDignitary.speech_bn : currentDignitary.speech_en}
              speakerName={isBn ? 'কেপিএল ধারাভাষ্যকার অ্যাভাটার' : 'KPL Virtual Announcer'}
              isAutoPlay={isAutoPlay}
              onSpeechEnd={() => {
                if (isAutoPlay) {
                  // Wait brief pause after narration completes before moving
                  setTimeout(() => handleNext(), 2000);
                }
              }}
              language={isBn ? 'bn' : 'en'}
            />
          </div>

          {/* Right Column: 3D Holographic Dignitary Showcase Card */}
          <div className="lg:col-span-7 flex justify-center">
            <DignitaryCard3D
              dignitary={currentDignitary}
              language={isBn ? 'bn' : 'en'}
              currentIndex={currentIndex}
              totalCount={filteredDignitaries.length}
            />
          </div>
        </div>

        {/* Presentation Controls Deck */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          
          {/* Quick Info & Category Pill */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#C6FF3D] animate-ping" />
            <div>
              <p className="text-xs text-slate-400">
                {isBn ? 'বর্তমানে উপস্থাপিত হচ্ছেন' : 'Currently Presenting'}:
              </p>
              <p className="text-sm font-bold text-white">
                {isBn ? currentDignitary.name_bn : currentDignitary.name}
              </p>
            </div>
          </div>

          {/* Center Playback Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="পূর্ববর্তী অতিথি (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isAutoPlay
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-gradient-to-r from-emerald-500 to-[#C6FF3D] hover:opacity-95 text-slate-950'
              }`}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{isBn ? 'পজ করুন' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isBn ? 'স্বয়ংক্রিয় প্লে (Auto)' : 'Auto Play'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-[#C6FF3D]/10 hover:bg-[#C6FF3D]/20 text-[#C6FF3D] border border-[#C6FF3D]/40 transition-all hover:scale-105 active:scale-95"
              title="পরবর্তী অতিথি (Right Arrow or Space)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Step Timeline Indicator & Shortcuts Help */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="hidden md:flex items-center gap-1 font-mono">
              {filteredDignitaries.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    playFanfare();
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-6 bg-[#C6FF3D]'
                      : i < currentIndex
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`অতিথি ${i + 1}`}
                />
              ))}
            </div>

            <span className="font-mono font-bold text-slate-200">
              {formatNumber(currentIndex + 1)} / {formatNumber(filteredDignitaries.length)}
            </span>
          </div>
        </div>
      </main>

      {/* Quick Jump Drawer Modal (All Dignitaries Directory) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col p-6 overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  {isBn ? 'সকল অতিথি সূচী' : 'Dignitaries Directory'}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                ✕ {isBn ? 'বন্ধ' : 'Close'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 mt-4 flex-1">
              {filteredDignitaries.map((dig, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={dig.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsDrawerOpen(false);
                      playFanfare();
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-[#C6FF3D]/10 border-[#C6FF3D] shadow-md'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-slate-500 w-5">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 border border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dig.photo_url}
                        alt={dig.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {isBn ? dig.name_bn : dig.name}
                        </span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF3D]" />}
                      </div>
                      <span className="text-[11px] text-emerald-400 truncate block">
                        {isBn ? dig.role_bn : dig.role}
                      </span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {isBn ? dig.badge_bn : dig.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              <Compass className="w-4 h-4 mx-auto mb-1 text-[#C6FF3D]" />
              <span>{isBn ? 'যে কোনো কার্ডে ক্লিক করে সরাসরি নেভিগেট করুন' : 'Click any card to present immediately'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
