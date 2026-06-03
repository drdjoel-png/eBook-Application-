/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenType, ModuleType } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { translations, LangType } from '../translations';

interface LandingViewProps {
  lang: LangType;
  onSelectModule: (module: ModuleType) => void;
}

export default function LandingView({ lang, onSelectModule }: LandingViewProps) {
  const t = translations[lang].landing;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 md:py-10 flex flex-col justify-center items-center text-center animate-fade-in space-y-8" id="landing-screen">
      
      {/* 1. TITLE & SUBTITLE */}
      <div className="text-center space-y-3 w-full flex flex-col items-center" id="landing-header">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-center" id="app-landing-title">
          {t.title}
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-semibold text-center" id="app-landing-subtitle">
          {t.subtitle}
        </p>
        
        {/* Callout Indicator */}
        <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-brand-teal/5 border border-brand-teal/10 text-brand-teal-dark rounded-full text-[11px] font-bold tracking-wide animate-bounce mt-1">
          <span className="text-xs">👇</span>
          <span>{lang === 'id' ? 'Pilih Gejala Utama Ananda' : 'Choose Your Child\'s Main Symptom'}</span>
        </div>
      </div>

      {/* 2. THREE LARGE MODULE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full" id="modes-grid">
        {/* CARD 1: FEVER / DEMAM */}
        <div 
          onClick={() => onSelectModule('DEMAM')}
          className="group relative bg-[#FCFAF5] p-6 rounded-3xl border border-amber-200 hover:border-amber-450 hover:bg-white shadow-[0_8px_24px_rgba(245,158,11,0.01)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.04)] hover:-translate-y-0.5 transition duration-300 cursor-pointer text-center flex flex-col justify-between items-center space-y-6"
          id="menu-demam-card"
        >
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 select-none">
              <Thermometer className="w-7 h-7" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-display font-black text-slate-800 text-lg uppercase flex items-center justify-center gap-1.5">
                {t.menuDemamTitle}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold text-center" id="menu-demam-desc">
                {t.menuDemamDesc}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectModule('DEMAM');
            }}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-display font-black rounded-2xl text-xs sm:text-sm transition duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>{lang === 'id' ? 'Cek Demam' : 'Check Fever'}</span>
            <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 2: VOMITING/DIARRHEA */}
        <div 
          onClick={() => onSelectModule('MUNTAH_DIARE')}
          className="group relative bg-[#F7FCFA] p-6 rounded-3xl border border-emerald-200 hover:border-emerald-450 hover:bg-white shadow-[0_8px_24px_rgba(16,185,129,0.01)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.04)] hover:-translate-y-0.5 transition duration-300 cursor-pointer text-center flex flex-col justify-between items-center space-y-6"
          id="menu-muntah-card"
        >
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 select-none">
              <Droplets className="w-7 h-7" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-display font-black text-slate-800 text-lg uppercase flex items-center justify-center gap-1.5">
                {t.menuMuntahTitle}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold text-center" id="menu-muntah-desc">
                {t.menuMuntahDesc}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectModule('MUNTAH_DIARE');
            }}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black rounded-2xl text-xs sm:text-sm transition duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>{lang === 'id' ? 'Cek Muntah / Diare' : 'Check Vomiting / Diarrhea'}</span>
            <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 3: COUGH/SHORTNESS OF BREATH */}
        <div 
          onClick={() => onSelectModule('BATUK_SESAK')}
          className="group relative bg-[#F6F7FE] p-6 rounded-3xl border border-blue-200 hover:border-blue-450 hover:bg-white shadow-[0_8px_24px_rgba(59,130,246,0.01)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.04)] hover:-translate-y-0.5 transition duration-300 cursor-pointer text-center flex flex-col justify-between items-center space-y-6"
          id="menu-batuk-card"
        >
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 select-none">
              <Wind className="w-7 h-7" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-display font-black text-slate-800 text-lg uppercase flex items-center justify-center gap-1.5">
                {t.menuBatukTitle}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold text-center" id="menu-batuk-desc">
                {t.menuBatukDesc}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectModule('BATUK_SESAK');
            }}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-display font-black rounded-2xl text-xs sm:text-sm transition duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>{lang === 'id' ? 'Cek Batuk / Sesak' : 'Check Cough / Breath'}</span>
            <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 3. VALUE PROPOSITIONS */}
      <div className="w-full pt-10 pb-4 border-t border-slate-100/75 flex flex-col items-center text-center space-y-8" id="value-proposition">
        <div className="text-center space-y-2">
          <span className="text-[10.5px] font-extrabold text-[#5FB7B9] uppercase tracking-widest block text-center" id="value-prop-span">
            {t.valuePropTitle}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-800 text-center tracking-tight leading-snug" id="value-prop-header">
            {t.valuePropSubtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch" id="benefits-grid">
          {/* Card 1 */}
          <div className="relative bg-white border border-amber-100/60 shadow-xs rounded-[24px] p-6 flex flex-col items-center text-center h-full transition duration-300 hover:shadow-md justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6EC] text-amber-500 flex items-center justify-center shadow-2xs mb-4 shrink-0 select-none">
              <Thermometer className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-center flex-grow flex flex-col justify-start">
              <h4 className="font-display font-extrabold text-slate-800 text-sm sm:text-base leading-snug tracking-tight text-center">
                {t.benefit1Title}
              </h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed text-center font-medium">
                {t.benefit1Desc}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative bg-white border border-rose-100/60 shadow-xs rounded-[24px] p-6 flex flex-col items-center text-center h-full transition duration-300 hover:shadow-md justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-rose-500 flex items-center justify-center shadow-2xs mb-4 shrink-0 select-none">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-center flex-grow flex flex-col justify-start">
              <h4 className="font-display font-extrabold text-slate-800 text-sm sm:text-base leading-snug tracking-tight text-center">
                {t.benefit2Title}
              </h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed text-center font-medium">
                {t.benefit2Desc}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative bg-white border border-teal-100/60 shadow-xs rounded-[24px] p-6 flex flex-col items-center text-center h-full transition duration-300 hover:shadow-md justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F6F6] text-teal-500 flex items-center justify-center shadow-2xs mb-4 shrink-0 select-none">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-center flex-grow flex flex-col justify-start">
              <h4 className="font-display font-extrabold text-slate-800 text-sm sm:text-base leading-snug tracking-tight text-center">
                {t.benefit3Title}
              </h4>
              <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed text-center font-medium">
                {t.benefit3Desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="p-4 sm:p-5 bg-[#FFFDE7]/85 border border-amber-150 rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-3xs w-full" id="landing-disclaimer-card">
        <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mx-auto" id="landing-disclaimer-info-icon" />
        <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed text-center" id="landing-disclaimer-text">
          {lang === 'id' 
            ? 'Panduan ini membantu mengenali tingkat risiko awal. Jika ananda tampak gawat mangap, '
            : 'This guide helps recognize initial risk levels. If your child appears severely ill, '}
          <span className="font-extrabold text-red-650 bg-red-50/80 px-1 rounded border border-rose-100">
            {lang === 'id' ? 'jangan menunggu' : 'do not wait'}
          </span>
          {lang === 'id' 
            ? ' hasil peninjauan aplikasi dan segera cari pemeriksaan asuhan medis di rumah sakit/faskes terdekat.'
            : ' for the results of the application review and immediately seek medical care at the nearest hospital/healthcare facility.'}
        </p>
      </div>

    </div>
  );
}
