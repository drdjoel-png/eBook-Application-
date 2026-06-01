/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertOctagon, BookOpen } from 'lucide-react';
import { ScreenType } from '../types';

interface LandingViewProps {
  onNavigate: (screen: ScreenType) => void;
  onStartPanicCheck: () => void;
}

export default function LandingView({ onNavigate, onStartPanicCheck }: LandingViewProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-between animate-fade-in" id="landing-screen">
      {/* Header section with warm branding */}
      <div className="text-center mt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-teal-light mb-3 text-brand-teal-dark">
          <BookOpen className="w-7 h-7" strokeWidth={2} />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-800 mb-2 leading-tight">
          Panduan Interaktif Demam Anak
        </h1>
        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto mb-4">
          Bantu Bunda mengambil keputusan tepat secara mandiri dengan mengevaluasi kondisi fisik, durasi demam, dan riwayat kesehatan ananda.
        </p>

        {/* 3 Highlight Conditions */}
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-1 text-center" id="landing-conditions-highlights">
          <div className="bg-[#E8F5E9] border border-emerald-100 p-2 rounded-2xl flex flex-col items-center">
            <span className="text-base mb-0.5 leading-none">🟢</span>
            <span className="text-[10px] font-bold text-[#2E7D32] leading-tight block">Pantau</span>
            <span className="text-[8px] text-emerald-700/80 font-medium block mt-0.5 leading-none">Di rumah</span>
          </div>
          <div className="bg-[#FFFDE7] border border-yellow-100 p-2 rounded-2xl flex flex-col items-center">
            <span className="text-base mb-0.5 leading-none">🟡</span>
            <span className="text-[10px] font-bold text-[#F9A825] leading-tight block">Waspada</span>
            <span className="text-[8px] text-amber-800/80 font-medium block mt-0.5 leading-none">Cek gejala</span>
          </div>
          <div className="bg-[#FCE4EC] border border-rose-100 p-2 rounded-2xl flex flex-col items-center">
            <span className="text-base mb-0.5 leading-none">🔴</span>
            <span className="text-[10px] font-bold text-[#D32F2F] leading-tight block">Segera IGD</span>
            <span className="text-[8px] text-rose-800/80 font-medium block mt-0.5 leading-none">Tanda bahaya</span>
          </div>
        </div>
      </div>

      {/* Primary Choices */}
      <div className="my-4 space-y-3">
        {/* Card 1: Panic Alert */}
        <div 
          className="bg-brand-card p-6 rounded-3xl border border-rose-100 border-l-[6px] border-l-[#FF4D4D] shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          onClick={onStartPanicCheck}
          id="panic-check-card"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                🚨 Saya sedang panik
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Langsung cek tanda bahaya dan dapatkan arahan awal untuk ananda.
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStartPanicCheck();
            }}
            className="w-full py-3.5 bg-[#FF4D4D] hover:bg-red-600 text-white font-display font-semibold rounded-2xl text-xs transition duration-200 shadow-sm cursor-pointer text-center"
          >
            Mulai cek sekarang
          </button>
        </div>

        {/* Card 2: Want to Learn */}
        <div 
          className="bg-brand-card p-6 rounded-3xl border border-brand-teal-light border-l-[6px] border-l-brand-teal shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(20,184,166,0.08)] transition-all cursor-pointer flex flex-col justify-between"
          onClick={() => onNavigate('BELAJAR')}
          id="learn-check-card"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-brand-teal-light text-brand-teal-dark rounded-2xl shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base">
                📘 Saya ingin belajar
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Pahami dulu cara menilai demam anak dengan lebih tenang dan bijak.
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('BELAJAR');
            }}
            className="w-full py-3 border-2 border-brand-teal text-brand-teal hover:bg-brand-teal-light hover:text-brand-teal-dark bg-white font-display font-semibold rounded-2xl text-xs transition duration-200 shadow-sm cursor-pointer text-center"
          >
            Baca penjelasan singkat
          </button>
        </div>
      </div>

      {/* Bottom info section */}
      <div className="text-center text-slate-400 space-y-2 mt-auto pb-4" />
    </div>
  );
}
