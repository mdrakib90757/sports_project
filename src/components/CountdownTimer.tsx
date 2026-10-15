'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { formatNumber, language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(targetDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { labelEn: 'DAYS', labelBn: 'দিন', value: timeLeft.days },
    { labelEn: 'HOURS', labelBn: 'ঘণ্টা', value: timeLeft.hours },
    { labelEn: 'MINUTES', labelBn: 'মিনিট', value: timeLeft.minutes },
    { labelEn: 'SECONDS', labelBn: 'সেকেন্ড', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-13 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <span className="text-xl sm:text-2xl font-black text-white tracking-wider font-mono">
              {formatNumber(u.value < 10 ? `0${u.value}` : u.value)}
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 mt-1 uppercase">
            {language === 'bn' ? u.labelBn : u.labelEn}
          </span>
        </div>
      ))}
    </div>
  );
}
