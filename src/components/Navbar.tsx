'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Menu,
  X,
  Shield,
  Home,
  Calendar,
  BarChart3,
  Users,
  Award,
  GitBranch,
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTournamentStore } from '@/lib/data/tournamentStore';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t, getLocalizedText, formatNumber } = useLanguage();
  const { matches, tournament, isAdmin } = useTournamentStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const liveMatchesCount = matches.filter(
    (m) =>
      m.status === 'live_first_half' ||
      m.status === 'live_second_half' ||
      m.status === 'half_time' ||
      m.status === 'extra_time' ||
      m.status === 'penalties'
  ).length;

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/fixtures', label: t.nav.fixtures, icon: Calendar },
    { href: '/standings', label: t.nav.standings, icon: BarChart3 },
    { href: '/teams', label: t.nav.teams, icon: Users },
    { href: '/stats', label: t.nav.topScorers, icon: Award },
    { href: '/bracket', label: t.nav.bracket, icon: GitBranch },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {getLocalizedText(tournament.name, tournament.name_bn)}
                </span>
                {liveMatchesCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>{formatNumber(liveMatchesCount)} {t.nav.liveNow}</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                {tournament.season} • {t.tournament.officialSite}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Bar (Consistent height, padding, and typography) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-9 px-3.5 rounded-lg text-sm font-semibold inline-flex items-center transition-all duration-150 ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Portal Nav Item (Consistent with all other nav links) */}
            <Link
              href="/admin"
              className={`h-9 px-3.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-all duration-150 ${
                pathname === '/admin'
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.nav.admin}</span>
              {mounted && isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`h-7 px-2.5 text-xs font-bold rounded transition-all ${
                  language === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="English Language"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`h-7 px-2.5 text-xs font-bold rounded transition-all font-bangla ${
                  language === 'bn'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Bengali Language"
              >
                বাং
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu (Clean, fully responsive on mobile Chrome) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-4 space-y-1.5 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              href="/admin"
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/admin'
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                  : 'text-amber-300 hover:bg-slate-900 border border-amber-500/20 bg-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>{t.nav.admin}</span>
              </div>
              {mounted && isAdmin && (
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
