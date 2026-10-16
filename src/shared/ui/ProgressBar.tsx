'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const isBusy = isFetching > 0 || isMutating > 0;

  // Trigger on route changes
  useEffect(() => {
    setProgress(30);
    setVisible(true);

    const timer1 = setTimeout(() => setProgress(75), 100);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, searchParams]);

  // Trigger on background queries/mutations
  useEffect(() => {
    if (isBusy) {
      setVisible(true);
      setProgress((prev) => (prev < 20 ? 40 : Math.min(prev + 20, 85)));
    } else {
      if (visible) {
        setProgress(100);
        const timer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [isBusy]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-[#C6FF3D] shadow-[0_0_12px_#C6FF3D,0_0_4px_#C6FF3D] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
