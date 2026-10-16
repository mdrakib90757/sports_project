import { Suspense } from 'react';
import type { Metadata } from 'next';
import { outfit, hindSiliguri } from './fonts';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { TournamentStoreProvider } from '@/lib/data/tournamentStore';
import { QueryProvider } from './QueryProvider';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveGoalPopup } from '@/components/LiveGoalPopup';
import { MatchCardSkeleton } from '@/shared/ui/Skeleton';

export const metadata: Metadata = {
  title: 'কচনাপুর প্রিমিয়ার লিগ সিজন ৩ | Kochnapur Premier League Season 3',
  description:
    'কচনাপুর প্রিমিয়ার লিগ সিজন ৩ (KPL Season 3) এর অফিশিয়াল লাইভ স্কোর, গোল অ্যালার্ট, ফিক্সচার, পয়েন্ট টেবিল ও ম্যাচ পোস্টার।',
  keywords: [
    'কচনাপুর প্রিমিয়ার লিগ',
    'kochnapur premier league',
    'kpl season 3',
    'football live score',
    'kochnapur tournament',
  ],
  authors: [{ name: 'Kochnapur Premier League Committee' }],
  openGraph: {
    title: 'কচনাপুর প্রিমিয়ার লিগ সিজন ৩ | KPL Season 3 Live Score',
    description: 'লাইভ স্কোর, গোল আপডেট, ট্যাকটিক্যাল একাদশ ও পয়েন্ট টেবিল।',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${outfit.variable} ${hindSiliguri.variable} dark antialiased h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#080c14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950"
        suppressHydrationWarning
      >
        <QueryProvider>
          <LanguageProvider>
            <TournamentStoreProvider>
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              <LiveGoalPopup />
              <Suspense fallback={<div className="h-16 sm:h-20 bg-slate-950/80" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Suspense
                  fallback={
                    <div className="space-y-6 animate-pulse">
                      <div className="h-48 rounded-3xl bg-slate-900/60 border border-slate-800" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                      </div>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </main>
              <Footer />
            </TournamentStoreProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
