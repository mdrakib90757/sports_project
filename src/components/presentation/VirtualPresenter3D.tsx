'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Mic, Sparkles, Activity } from 'lucide-react';

interface VirtualPresenter3DProps {
  speechText: string;
  speakerName?: string;
  isAutoPlay?: boolean;
  onSpeechEnd?: () => void;
  language?: 'bn' | 'en';
}

export const VirtualPresenter3D: React.FC<VirtualPresenter3DProps> = ({
  speechText,
  speakerName = 'কেপিএল ভার্চুয়াল ধারাভাষ্যকার',
  isAutoPlay = false,
  onSpeechEnd,
  language = 'bn',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [mouthOpen, setMouthOpen] = useState(false);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Typewriter effect for speech subtitles
  useEffect(() => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    setDisplayedText('');

    let charIndex = 0;
    const speed = isSpeaking ? 35 : 18;

    typewriterTimerRef.current = setInterval(() => {
      if (charIndex < speechText.length) {
        setDisplayedText((prev) => speechText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      }
    }, speed);

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [speechText, isSpeaking]);

  // Speaking mouth cadence animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 140);
    } else {
      setMouthOpen(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  // Mouse hover parallax tilt effect on 3D avatar
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setHeadTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setHeadTilt({ x: 0, y: 0 });
  };

  // Web Speech API execution
  const speakCurrentText = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback: visual speaking state without TTS
      simulateVisualSpeech();
      return;
    }

    window.speechSynthesis.cancel();

    if (isMuted) {
      simulateVisualSpeech();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    speechUtteranceRef.current = utterance;

    // Pick best available voice (prefer Bengali or native)
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.lang.includes('BD') || v.lang.includes('IN'));
    if (bnVoice && language === 'bn') {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      simulateVisualSpeech();
    };

    window.speechSynthesis.speak(utterance);
  };

  const simulateVisualSpeech = () => {
    setIsSpeaking(true);
    const duration = Math.min(Math.max(speechText.length * 60, 4000), 12000);
    setTimeout(() => {
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    }, duration);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Trigger speech when text updates if auto-play is enabled
  useEffect(() => {
    stopSpeaking();
    if (isAutoPlay) {
      const timer = setTimeout(() => {
        speakCurrentText();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [speechText, isAutoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center select-none"
    >
      {/* 3D Holographic Stage Pedestal */}
      <div className="relative w-64 h-80 sm:w-72 sm:h-96 flex items-center justify-center">
        {/* Hologram rings & energy cylinder */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer rotating neon halo */}
          <div
            className={`w-56 h-56 rounded-full border-2 border-dashed border-[#C6FF3D]/30 animate-[spin_20s_linear_infinite] transition-all duration-700 ${
              isSpeaking ? 'border-[#C6FF3D] scale-105 shadow-[0_0_40px_rgba(198,255,61,0.35)]' : ''
            }`}
          />
          {/* Inner pulsating glow disc */}
          <div
            className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#10b981]/20 via-[#C6FF3D]/10 to-blue-500/10 blur-xl transition-all duration-500 ${
              isSpeaking ? 'scale-125 opacity-100' : 'scale-90 opacity-40'
            }`}
          />
        </div>

        {/* 3D Avatar Body with CSS Perspective & Dynamic Rotation */}
        <div
          style={{
            transform: `perspective(800px) rotateY(${headTilt.x}deg) rotateX(${headTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
          className={`relative z-10 w-full h-full flex flex-col items-center justify-center filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
            isSpeaking ? 'animate-[bounce_2s_ease-in-out_infinite]' : 'animate-[pulse_4s_ease-in-out_infinite]'
          }`}
        >
          {/* Stylized Futuristic 3D Sports Avatar (SVG + Glow Layer) */}
          <svg viewBox="0 0 240 280" className="w-52 h-64 sm:w-60 sm:h-72">
            <defs>
              {/* Neon Gradients */}
              <linearGradient id="avatarSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f6d365" />
                <stop offset="100%" stopColor="#fda085" />
              </linearGradient>
              <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="limeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C6FF3D" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing Sports Headset & Antenna */}
            <path
              d="M 65 95 C 65 45, 175 45, 175 95"
              fill="none"
              stroke="#C6FF3D"
              strokeWidth="5"
              filter="url(#glowEffect)"
            />
            <circle cx="63" cy="98" r="9" fill="#1e293b" stroke="#C6FF3D" strokeWidth="2.5" />
            <circle cx="177" cy="98" r="9" fill="#1e293b" stroke="#C6FF3D" strokeWidth="2.5" />

            {/* Microphone Arm */}
            <path
              d="M 177 98 Q 185 140, 142 144"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Mic Capsule with live indicator */}
            <rect
              x="133"
              y="138"
              width="14"
              height="10"
              rx="4"
              fill={isSpeaking ? '#C6FF3D' : '#475569'}
              filter={isSpeaking ? 'url(#glowEffect)' : undefined}
            />

            {/* Stylized Modern Athletic Hair */}
            <path
              d="M 75 75 C 75 42, 110 32, 145 36 C 165 38, 175 55, 172 75 C 160 62, 135 60, 120 62 C 100 64, 85 70, 75 75 Z"
              fill="#1e293b"
            />

            {/* Face Shape */}
            <path
              d="M 80 80 Q 75 125, 120 155 Q 165 125, 160 80 Q 120 70, 80 80 Z"
              fill="url(#avatarSkin)"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />

            {/* Cyber Visor / High-Tech Sports Glasses */}
            <polygon
              points="82,88 158,88 150,112 90,112"
              fill="#0f172a"
              opacity="0.9"
              stroke="url(#limeGlow)"
              strokeWidth="2"
              filter="url(#glowEffect)"
            />
            {/* Visor digital HUD reflections */}
            <line x1="92" y1="94" x2="148" y2="94" stroke="#C6FF3D" strokeWidth="1" opacity="0.6" />
            <line
              x1="95"
              y1="102"
              x2="145"
              y2="102"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.8"
            />

            {/* Nose */}
            <path d="M 120 114 L 117 126 L 123 126 Z" fill="#d97706" opacity="0.5" />

            {/* Animated Mouth (Cadence synced to isSpeaking) */}
            {isSpeaking ? (
              mouthOpen ? (
                // Open speaking mouth
                <ellipse
                  cx="120"
                  cy="142"
                  rx="9"
                  ry="6"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              ) : (
                // Semi-closed talking mouth
                <path
                  d="M 112 142 Q 120 148, 128 142"
                  fill="none"
                  stroke="#991b1b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )
            ) : (
              // Pleasant closed smile
              <path
                d="M 112 140 Q 120 147, 128 140"
                fill="none"
                stroke="#b45309"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Neck & Gold Official Medal Ribbon */}
            <path d="M 106 150 L 106 172 L 134 172 L 134 150 Z" fill="#f59e0b" opacity="0.85" />

            {/* Athletic Blazer / League Official Presentation Jersey */}
            <path
              d="M 60 185 C 40 195, 30 220, 25 270 L 215 270 C 210 220, 200 195, 180 185 L 145 172 L 95 172 Z"
              fill="url(#jerseyGrad)"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Lapels / Collar in Emerald & Lime */}
            <path d="M 95 172 L 120 220 L 78 200 Z" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
            <path d="M 145 172 L 120 220 L 162 200 Z" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />

            {/* Official KPL Golden Crest Badge on Left Chest */}
            <g transform="translate(68, 215)">
              <polygon points="12,0 24,7 20,24 12,28 4,24 0,7" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
              <text x="12" y="16" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                KPL
              </text>
            </g>

            {/* Presenter Hand Gesturing to the Dignitary Stage */}
            <g
              className={`transition-transform duration-500 origin-[190px_220px] ${
                isSpeaking ? 'rotate-[-10deg]' : 'rotate-0'
              }`}
            >
              {/* Arm reaching out */}
              <path
                d="M 185 205 Q 215 190, 230 160"
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Hand with pointing finger */}
              <circle cx="230" cy="158" r="8" fill="url(#avatarSkin)" />
              <path
                d="M 230 158 L 245 145"
                stroke="url(#avatarSkin)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Hologram Sparkle from presenter finger */}
              <circle
                cx="248"
                cy="142"
                r="4"
                fill="#C6FF3D"
                filter="url(#glowEffect)"
                className={isSpeaking ? 'animate-ping' : ''}
              />
            </g>
          </svg>

          {/* Interactive Floating Status Pill */}
          <div className="mt-[-8px] flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-[#C6FF3D]/40 rounded-full shadow-lg backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-[#C6FF3D] animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-200">
              {isSpeaking ? (language === 'bn' ? 'উপস্থাপনা চলছে...' : 'Presenting...') : (language === 'bn' ? 'অপেক্ষা করছে' : 'Standby')}
            </span>
            <Activity className={`w-3 h-3 ${isSpeaking ? 'text-[#C6FF3D] animate-pulse' : 'text-slate-600'}`} />
          </div>
        </div>

        {/* Hologram Base Pedestal Platform */}
        <div className="absolute bottom-2 w-48 h-8 bg-gradient-to-r from-transparent via-[#C6FF3D]/20 to-transparent border-t border-[#C6FF3D]/40 rounded-[50%] blur-sm pointer-events-none" />
        <div className="absolute bottom-0 w-36 h-3 bg-[#C6FF3D]/30 rounded-full blur-md" />
      </div>

      {/* Voice Visualizer Spectrum Equalizer (When Speaking) */}
      <div className="h-6 flex items-end justify-center gap-1 my-2">
        {[40, 75, 100, 60, 90, 45, 80, 95, 55, 70, 85, 40].map((h, i) => (
          <span
            key={i}
            style={{
              height: isSpeaking ? `${Math.max(15, Math.round(h * Math.random()))}%` : '20%',
              transition: 'height 0.12s ease-in-out',
            }}
            className={`w-1 rounded-full ${
              isSpeaking
                ? 'bg-gradient-to-t from-[#10b981] to-[#C6FF3D]'
                : 'bg-slate-700/60'
            }`}
          />
        ))}
      </div>

      {/* Interactive Speech Bubble & Subtitles */}
      <div className="relative w-full max-w-lg mt-1 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
        {/* Subtle decorative arrow pointing up to avatar */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-l border-t border-slate-700/80 rotate-45" />

        {/* Speaker Name Tag & Audio Trigger Controls */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#C6FF3D]" />
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
              {speakerName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              title={isMuted ? 'ভয়েস চালু করুন' : 'ভয়েস মিউট করুন'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[10px] hidden sm:inline">{isMuted ? 'Muted' : 'Voice'}</span>
            </button>

            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[11px] font-semibold transition-all"
              >
                {language === 'bn' ? 'থামুন' : 'Stop'}
              </button>
            ) : (
              <button
                onClick={speakCurrentText}
                className="px-2.5 py-1 rounded-lg bg-[#C6FF3D]/20 hover:bg-[#C6FF3D]/30 text-[#C6FF3D] border border-[#C6FF3D]/40 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                {language === 'bn' ? 'বলুন (Speak)' : 'Speak'}
              </button>
            )}
          </div>
        </div>

        {/* Live Subtitle Script Display (Typewriter Effect) */}
        <div className="min-h-[72px] flex items-center">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-medium">
            &ldquo;{displayedText}&rdquo;
            {displayedText.length < speechText.length && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#C6FF3D] animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
