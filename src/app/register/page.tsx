'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  User,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Search,
  ExternalLink,
  Camera,
  Shirt,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { playersApi } from '@/features/players/api/playersApi';
import { PlayerPosition, Player } from '@/lib/types';
import { useTournamentStore } from '@/lib/data/tournamentStore';

// In-browser image compressor using HTML5 Canvas
async function compressImage(file: File, maxSize = 600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function RegisterPage() {
  const { language, t, getLocalizedText, formatNumber } = useLanguage();
  const { teams } = useTournamentStore();

  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');

  // Form inputs
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('FWD');
  const [jerseyNumber, setJerseyNumber] = useState<number | ''>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Player | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status check state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<Player | null | 'NOT_FOUND'>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo selection & compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'bn' ? 'দয়া করে একটি ছবি ফাইল সিলেক্ট করুন' : 'Please select an image file');
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMessage(null);
      const compressedDataUrl = await compressImage(file, 500, 0.82);
      setPhotoPreview(compressedDataUrl);
    } catch {
      setErrorMessage(language === 'bn' ? 'ছবি প্রসেস করতে ব্যর্থ হয়েছে' : 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage(language === 'bn' ? 'নাম এবং মোবাইল নম্বর আবশ্যক' : 'Name and phone are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const created = await playersApi.registerPlayer({
        name: name.trim(),
        nameBn: nameBn.trim() || undefined,
        phone: phone.trim(),
        position,
        photoUrl: photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      });

      setSubmitSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;

    try {
      setIsSearching(true);
      setSearchResult(null);
      const allPlayers = await playersApi.getPlayers();
      const match = allPlayers.find(
        (p) =>
          p.phone === searchPhone.trim() ||
          p.phone?.replace(/[^0-9]/g, '').endsWith(searchPhone.trim().replace(/[^0-9]/g, ''))
      );

      setSearchResult(match || 'NOT_FOUND');
    } catch {
      setSearchResult('NOT_FOUND');
    } finally {
      setIsSearching(false);
    }
  };

  const positionsList: { id: PlayerPosition; labelEn: string; labelBn: string; color: string }[] = [
    { id: 'FWD', labelEn: 'Forward', labelBn: 'ফরোয়ার্ড / স্ট্রাইকার', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400' },
    { id: 'MID', labelEn: 'Midfielder', labelBn: 'মিডফিল্ডার', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400' },
    { id: 'DEF', labelEn: 'Defender', labelBn: 'ডিফেন্ডার', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400' },
    { id: 'GK', labelEn: 'Goalkeeper', labelBn: 'গোলরক্ষক (GK)', color: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/40 text-purple-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-lime-400/15 text-lime-400 border border-lime-400/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'bn' ? 'অফিসিয়াল প্লেয়ার রেজিস্ট্রেশন' : 'Official Player Registration'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {language === 'bn' ? 'কচনাপুর প্রিমিয়ার লিগ সিজন ৩' : 'Kochnapur Premier League Season 3'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            {language === 'bn'
              ? 'টুর্নামেন্টের অফিসিয়াল নিলাম ও ড্র পুলে অংশ নিতে আপনার তথ্য ও ফটো দিয়ে নিবন্ধন সম্পন্ন করুন।'
              : 'Register your profile with photo and contact info to join the official tournament draft pool.'}
          </p>

          {/* Tab Switcher */}
          <div className="pt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`h-10 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'নতুন প্লেয়ার ফর্ম' : 'Registration Form'}
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`h-10 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'status'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'আমার স্ট্যাটাস ও লেভেল চেক' : 'Check My Status & Level'}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: REGISTRATION FORM */}
      {activeTab === 'register' && (
        <>
          {submitSuccess ? (
            /* Success Card */
            <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {language === 'bn' ? 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!' : 'Registration Submitted Successfully!'}
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  {language === 'bn'
                    ? 'আপনার তথ্য গৃহীত হয়েছে। অ্যাডমিন প্যানেল থেকে আপনার লেভেল (Level A/B/C/EXTRA) মূল্যায়ন করার পর আপনি ড্র পুলে অন্তর্ভুক্ত হবেন।'
                    : 'Your profile has been recorded. Once the tournament admin evaluates your level, you will be placed in the draft pool.'}
                </p>
              </div>

              {/* Preview of submitted player */}
              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
                <img
                  src={submitSuccess.photo_url}
                  alt={submitSuccess.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate">{submitSuccess.name}</div>
                  <div className="text-xs text-slate-400">{submitSuccess.phone}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {submitSuccess.position}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {language === 'bn' ? 'লেভেল পেন্ডিং' : 'Level Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmitSuccess(null);
                    setName('');
                    setNameBn('');
                    setPhone('');
                    setPhotoPreview('');
                  }}
                  className="h-10 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors"
                >
                  {language === 'bn' ? 'আরেকটি রেজিস্ট্রেশন করুন' : 'Register Another'}
                </button>
                <Link
                  href="/draw"
                  className="h-10 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-lime-400/20 transition-all"
                >
                  <span>{language === 'bn' ? 'লাইভ ড্র দেখুন' : 'View Live Draw'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Area (8 cols) */}
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6"
              >
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Photo Upload Section */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {language === 'bn' ? 'খেলোয়াড়ের ছবি (Photo Upload)' : 'Player Photo'}
                  </label>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center relative overflow-hidden group shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                      {isCompressing && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-lime-400 font-bold">
                          {language === 'bn' ? 'প্রসেসিং...' : 'Compressing...'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{photoPreview ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo') : (language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo')}</span>
                      </button>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn'
                          ? 'মোবাইল ক্যামেরা বা গ্যালারি থেকে যেকোনো ছবি। ব্রাউজার স্বয়ংক্রিয়ভাবে কম্প্রেস করে নেবে।'
                          : 'Any JPEG or PNG from your phone camera or gallery. Automatically optimized in-browser.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {language === 'bn' ? 'খেলোয়াড়ের নাম (ইংরেজিতে) *' : 'Full Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-lime-400 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {language === 'bn' ? 'খেলোয়াড়ের নাম (বাংলায়)' : 'Full Name (Bangla)'}
                    </label>
                    <input
                      type="text"
                      placeholder="উদাঃ তানভীর আহমেদ"
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-lime-400 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                {/* 3. Phone & Jersey */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {language === 'bn' ? 'মোবাইল নম্বর (যোগাযোগ ও যাচাইয়ের জন্য) *' : 'Mobile Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-lime-400 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {language === 'bn' ? 'পছন্দের জার্সি নম্বর (ঐচ্ছিক)' : 'Preferred Jersey Number'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="e.g. 10"
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-lime-400 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                {/* 4. Position Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {language === 'bn' ? 'খেলার পজিশন নির্বাচন করুন *' : 'Playing Position *'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {positionsList.map((pos) => {
                      const isSelected = position === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setPosition(pos.id)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'bg-lime-400 text-slate-950 border-lime-400 font-black shadow-lg shadow-lime-400/20 scale-[1.02]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 font-bold'
                          }`}
                        >
                          <div className="text-base font-black tracking-wider">{pos.id}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            {language === 'bn' ? pos.labelBn : pos.labelEn}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isCompressing}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-lime-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 fill-slate-950" />
                    <span>
                      {isSubmitting
                        ? (language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...')
                        : (language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration')}
                    </span>
                  </button>
                </div>
              </form>

              {/* LIVE PREVIEW CARD (4 cols) */}
              <div className="lg:col-span-4 sticky top-24 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {language === 'bn' ? 'প্লেয়ার কার্ড লাইভ প্রিভিউ' : 'Player Card Live Preview'}
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-amber-400 border border-amber-400/30">
                      LEVEL PENDING
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                      {position}
                    </span>
                  </div>

                  {/* Photo */}
                  <div className="relative mt-4">
                    <div className="w-28 h-28 rounded-2xl border-2 border-lime-400/60 overflow-hidden bg-slate-800 shadow-xl">
                      <img
                        src={photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {jerseyNumber && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-lime-400 text-lime-400 flex items-center justify-center font-black text-xs shadow-md">
                        #{jerseyNumber}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="mt-4 text-lg font-black text-white truncate max-w-full">
                    {name.trim() || (language === 'bn' ? 'খেলোয়াড়ের নাম' : 'Player Name')}
                  </h3>
                  {nameBn.trim() && <p className="text-xs text-slate-400 mt-0.5">{nameBn.trim()}</p>}

                  {/* Notice */}
                  <div className="w-full mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    {language === 'bn'
                      ? 'অ্যাডমিন কর্তৃক যাচাইয়ের পর লেভেল নির্ধারিত হবে।'
                      : 'Level will be officially assigned by admin.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: CHECK STATUS */}
      {activeTab === 'status' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-white">
              {language === 'bn' ? 'আমার স্ট্যাটাস ও লেভেল অনুসন্ধান' : 'Check Profile & Draft Status'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? 'আপনার রেজিস্টার্ড মোবাইল নম্বর লিখে সার্চ করুন।'
                : 'Enter your registered mobile phone number to check your level and drafted team.'}
            </p>
          </div>

          <form onSubmit={handleSearchStatus} className="flex gap-2">
            <input
              type="tel"
              required
              placeholder="01700000000"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-lime-400 focus:outline-none text-white text-sm"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="h-11 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? '...' : (language === 'bn' ? 'সার্চ' : 'Search')}</span>
            </button>
          </form>

          {/* Search Result Display */}
          {searchResult === 'NOT_FOUND' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center">
              {language === 'bn'
                ? 'এই নম্বরে কোনো প্লেয়ার পাওয়া যায়নি। অনুগ্রহ করে নম্বরটি সঠিক কিনা পরীক্ষা করুন অথবা নতুন রেজিস্ট্রেশন করুন।'
                : 'No player found with this phone number. Please check the number or register.'}
            </div>
          )}

          {searchResult && searchResult !== 'NOT_FOUND' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in-50">
              <div className="flex items-center gap-4">
                <img
                  src={searchResult.photo_url}
                  alt={searchResult.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400/80 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-black text-white">
                    {getLocalizedText(searchResult.name, searchResult.name_bn)}
                  </h4>
                  <div className="text-xs text-slate-400">{searchResult.phone}</div>
                  <div className="text-xs font-bold text-slate-300 mt-1 uppercase">
                    {searchResult.position}
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    {language === 'bn' ? 'অ্যাডমিন নির্ধারিত লেভেল' : 'Assigned Level'}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase bg-lime-400 text-slate-950">
                      LEVEL {searchResult.level || 'A'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    {language === 'bn' ? 'বর্তমান দল (Team)' : 'Drafted Team'}
                  </div>
                  <div className="mt-1">
                    {(() => {
                      const draftedTeam = teams.find((t) => t.id === searchResult.team_id);
                      if (draftedTeam) {
                        return (
                          <Link
                            href={`/teams/${draftedTeam.id}`}
                            className="text-xs font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
                          >
                            <img src={draftedTeam.logo_url} alt="" className="w-4 h-4 object-contain" />
                            <span className="truncate">{getLocalizedText(draftedTeam.name, draftedTeam.name_bn)}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        );
                      }
                      return (
                        <span className="text-xs font-bold text-amber-400">
                          {language === 'bn' ? 'ড্র পুলে অপেক্ষমাণ' : 'In Draft Pool'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
