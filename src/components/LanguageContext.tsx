'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
  getLocalizedText: (enText: string, bnText?: string | null) => string;
  formatNumber: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sports_app_lang') as Language;
    if (saved === 'en' || saved === 'bn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sports_app_lang', lang);
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'bn' : 'en';
    setLanguage(next);
  };

  // During SSR and initial hydration before mount, use default 'bn'
  const activeLang = mounted ? language : 'bn';

  const getLocalizedText = (enText: string, bnText?: string | null) => {
    if (activeLang === 'bn' && bnText && bnText.trim().length > 0) {
      return bnText;
    }
    return enText;
  };

  const formatNumber = (num: number | string): string => {
    const str = String(num);
    if (activeLang !== 'bn') return str;
    return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] ?? d);
  };

  const t = translations[activeLang];

  return (
    <LanguageContext.Provider
      value={{
        language: activeLang,
        setLanguage,
        toggleLanguage,
        t,
        getLocalizedText,
        formatNumber,
      }}
    >
      <div className={activeLang === 'bn' ? 'font-bangla' : ''} suppressHydrationWarning>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
