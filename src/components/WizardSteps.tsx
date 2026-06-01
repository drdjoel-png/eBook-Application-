/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction } from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Baby, 
  Thermometer, 
  Clock, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { WizardData, TandaBahayaState, CaraUkurType, LamaDemamType, RiwayatKejangType, ScreenType } from '../types';

interface WizardStepsProps {
  onNavigate: (screen: ScreenType) => void;
  wizardData: WizardData;
  setWizardData: Dispatch<SetStateAction<WizardData>>;
  onCompleteWizard: () => void;
}

export default function WizardSteps({ 
  onNavigate, 
  wizardData, 
  setWizardData, 
  onCompleteWizard 
}: WizardStepsProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [suhuError, setSuhuError] = useState<string | null>(null);

  // Logic: "Jika salah satu card dijawab 'Ada' -> langsung hasil 🔴 Segera ke IGD"
  const handleTandaBahayaSelect = (key: keyof TandaBahayaState, val: 'TIDAK' | 'ADA') => {
    const updatedTandaBahaya = { ...wizardData.tandaBahaya, [key]: val };
    
    setWizardData(prev => ({
      ...prev,
      tandaBahaya: updatedTandaBahaya
    }));

    if (val === 'ADA') {
      // Direct jump to results!
      // We force the triage level to MERAH and transition
      onCompleteWizard();
    }
  };

  // Age calculations & validation
  const getAgeInMonths = (): number => {
    const yrs = typeof wizardData.usiaTahun === 'number' ? wizardData.usiaTahun : 0;
    const mths = typeof wizardData.usiaBulan === 'number' ? wizardData.usiaBulan : 0;
    return (yrs * 12) + mths;
  };

  const handleAgeChange = (field: 'usiaTahun' | 'usiaBulan', value: string) => {
    const parsed = value === '' ? '' : parseInt(value, 10);
    if (parsed !== '' && (isNaN(parsed) || parsed < 0)) return;
    
    setWizardData(prev => ({
      ...prev,
      [field]: parsed
    }));
  };

  // Temperature validation
  const handleSuhuChange = (val: string) => {
    // allow typing decimals but replace comma with dot
    const formatted = val.replace(',', '.');
    setWizardData(prev => ({ ...prev, suhu: formatted }));
    
    // reset error while typing
    setSuhuError(null);
  };

  const validateSuhuAndNext = () => {
    const numericSuhu = parseFloat(wizardData.suhu);
    if (isNaN(numericSuhu) || numericSuhu < 35 || numericSuhu > 42) {
      setSuhuError('Angka suhu tampak tidak sesuai. Mohon cek ulang hasil termometer dan masukkan kembali suhu dalam °C (rentang 35°C - 42°C).');
      return;
    }
    setSuhuError(null);
    setCurrentStep(4);
  };

  // Navigation Logic
  const canGoNext = (): boolean => {
    if (currentStep === 1) {
      // Step 1: All 4 danger questions must be explicitly answered
      const { respons, napas, minumBak, tandaLain } = wizardData.tandaBahaya;
      return respons !== null && napas !== null && minumBak !== null && tandaLain !== null;
    }
    if (currentStep === 2) {
      // Step 2: Age Year is required (Even if 0, but Must be answered. "usiaTahun" can't be empty)
      return wizardData.usiaTahun !== '';
    }
    if (currentStep === 3) {
      // Step 3: Suhu and Cara Ukur are required
      return wizardData.suhu.trim() !== '' && wizardData.caraUkur !== null;
    }
    if (currentStep === 4) {
      // Step 4: Duration of fever is required
      return wizardData.lamaDemam !== null;
    }
    if (currentStep === 5) {
      // Step 5: History of convulsion is required
      return wizardData.riwayatKejang !== null;
    }
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) return;

    if (currentStep === 2) {
      // Check age < 1 year lock
      const totalMonths = getAgeInMonths();
      if (totalMonths < 12) {
        // Stop here and render the warning box (handled inline in render)
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      validateSuhuAndNext();
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      onCompleteWizard();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onNavigate('LANDING');
    }
  };

  // Progress UI rendering helpers
  const stepTitles = [
    'Tanda Bahaya',
    'Usia Anak',
    'Suhu & Pengukuran',
    'Lama Demam',
    'Riwayat Kejang',
  ];

  const renderProgressDots = () => {
    return (
      <div className="flex justify-center items-center gap-2 my-2.5" aria-hidden="true" id="progress-dots-container">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <span 
            key={idx}
            className={`h-2 transition-all duration-300 ${
              idx === currentStep 
                ? 'bg-brand-teal w-5 rounded-[10px]' 
                : idx < currentStep 
                  ? 'bg-brand-teal/40 w-2 rounded-full' 
                  : 'bg-slate-200 w-2 rounded-full'
            }`}
          />
        ))}
      </div>
    );
  };

  // Main UI Renders per step
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3.5 flex flex-col justify-between" id="wizard-screen">
      {/* Top micro progress bar and steps */}
      <div className="w-full">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <button
            onClick={handlePrev}
            className="p-1 text-slate-400 hover:text-slate-600 transition"
            id="wizard-back-button"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Langkah {currentStep}/6 · {stepTitles[currentStep - 1] || 'Penilaian'}
            </span>
            {renderProgressDots()}
          </div>
          
          <div className="w-5" /> {/* Spacer to align title center */}
        </div>

        {/* STEP 1: TANDA BAHAYA */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in" id="step-1-tanda-bahaya">
            <div className="mb-4">
              <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
                Cek dulu, ada tanda bahaya tidak?
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Kalau ada salah satu saja, ananda sebaiknya segera dibawa ke IGD.
              </p>
            </div>

            {/* Danger Card 1: Respons */}
            <div className={`p-4 rounded-2xl border transition-all ${
              wizardData.tandaBahaya.respons === 'ADA' 
                ? 'bg-red-50/75 border-red-200' 
                : wizardData.tandaBahaya.respons === 'TIDAK'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-brand-card border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5">Respons Anak</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Apakah respons ananda berubah?</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-light">
                  Contoh: Kejang, sulit dibangunkan, sangat lemas, atau tidak merespons Bunda.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('respons', 'TIDAK')}
                  className={`py-2 px-3 rounded-xl font-display font-medium text-xs border transition-all ${
                    wizardData.tandaBahaya.respons === 'TIDAK'
                      ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 Tidak ada
                </button>
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('respons', 'ADA')}
                  className="py-2 px-3 rounded-xl font-display font-semibold text-xs border bg-red-50 hover:bg-red-100 border-red-300 text-red-700 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ada 🚨</span>
                </button>
              </div>
            </div>

            {/* Danger Card 2: Napas */}
            <div className={`p-4 rounded-2xl border transition-all ${
              wizardData.tandaBahaya.napas === 'ADA' 
                ? 'bg-red-50/75 border-red-200' 
                : wizardData.tandaBahaya.napas === 'TIDAK'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-brand-card border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5">Napas</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Apakah napas ananda tampak berat?</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-light">
                  Contoh: Sesak napas, dada bekerja sangat keras (cekgungan), atau bibir kebiruan.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('napas', 'TIDAK')}
                  className={`py-2 px-3 rounded-xl font-display font-medium text-xs border transition-all ${
                    wizardData.tandaBahaya.napas === 'TIDAK'
                      ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 Tidak ada
                </button>
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('napas', 'ADA')}
                  className="py-2 px-3 rounded-xl font-display font-semibold text-xs border bg-red-50 hover:bg-red-100 border-red-300 text-red-700 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ada 🚨</span>
                </button>
              </div>
            </div>

            {/* Danger Card 3: Minum & BAK */}
            <div className={`p-4 rounded-2xl border transition-all ${
              wizardData.tandaBahaya.minumBak === 'ADA' 
                ? 'bg-red-50/75 border-red-200' 
                : wizardData.tandaBahaya.minumBak === 'TIDAK'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-brand-card border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5">Minum & BAK</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Apakah minum atau BAK sangat bermasalah?</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-light">
                  Contoh: Tidak mau minum sama sekali, muntah terus-menerus, atau urin/BAK sangat sedikit.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('minumBak', 'TIDAK')}
                  className={`py-2 px-3 rounded-xl font-display font-medium text-xs border transition-all ${
                    wizardData.tandaBahaya.minumBak === 'TIDAK'
                      ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 Tidak ada
                </button>
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('minumBak', 'ADA')}
                  className="py-2 px-3 rounded-xl font-display font-semibold text-xs border bg-red-50 hover:bg-red-100 border-red-300 text-red-700 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ada 🚨</span>
                </button>
              </div>
            </div>

            {/* Danger Card 4: Tanda Lain */}
            <div className={`p-4 rounded-2xl border transition-all ${
              wizardData.tandaBahaya.tandaLain === 'ADA' 
                ? 'bg-red-50/75 border-red-200' 
                : wizardData.tandaBahaya.tandaLain === 'TIDAK'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-brand-card border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-0.5">Tanda Lain</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Apakah ada tanda lain yang mengkhawatirkan?</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-light">
                  Contoh: Ruam merah gelap / keunguan, leher tampak kaku, atau anak tampak sangat kesakitan.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('tandaLain', 'TIDAK')}
                  className={`py-2 px-3 rounded-xl font-display font-medium text-xs border transition-all ${
                    wizardData.tandaBahaya.tandaLain === 'TIDAK'
                      ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 Tidak ada
                </button>
                <button
                  type="button"
                  onClick={() => handleTandaBahayaSelect('tandaLain', 'ADA')}
                  className="py-2 px-3 rounded-xl font-display font-semibold text-xs border bg-red-50 hover:bg-red-100 border-red-300 text-red-700 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Ada 🚨</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: USIA */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in" id="step-2-usia">
            <div className="mb-2">
              <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
                Berapa usia ananda?
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Panduan ini dibuat terutama untuk anak usia 1–5 tahun.
              </p>
            </div>

            <div className="bg-brand-card p-6 rounded-3xl border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-3 text-brand-teal mb-2">
                <Baby className="w-5 h-5" />
                <span className="font-display font-bold text-xs text-slate-700">Usia Ananda Saat Ini</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="usia-tahun-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Tahun *
                  </label>
                  <div className="relative">
                    <input
                      id="usia-tahun-input"
                      type="number"
                      placeholder="Contoh: 3"
                      value={wizardData.usiaTahun}
                      onChange={(e) => handleAgeChange('usiaTahun', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium transition duration-200 outline-none"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs pointer-events-none">th</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="usia-bulan-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Bulan (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      id="usia-bulan-input"
                      type="number"
                      placeholder="Contoh: 4"
                      max={11}
                      value={wizardData.usiaBulan}
                      onChange={(e) => handleAgeChange('usiaBulan', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium transition duration-200 outline-none"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs pointer-events-none">bln</span>
                  </div>
                </div>
              </div>

              {/* Realtime helper text for entered age */}
              {wizardData.usiaTahun !== '' && (
                <div className="p-3 bg-brand-teal-light/50 border border-brand-teal-light rounded-xl text-xs text-brand-teal-dark font-medium text-center">
                  Usia terinput: {wizardData.usiaTahun} tahun {wizardData.usiaBulan !== '' ? `${wizardData.usiaBulan} bulan` : ''}
                </div>
              )}
            </div>

            {/* AGE EXCLUSION BLOCK FOR INFANTS < 1 YEAR */}
            {wizardData.usiaTahun !== '' && getAgeInMonths() < 12 && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm text-center space-y-4 animate-fade-in" id="age-exclusion-banner">
                <div className="inline-flex p-2 bg-red-100 rounded-full text-red-600">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display font-bold text-red-800 text-xs">Pemberitahuan Khusus</h4>
                  <p className="text-red-700 text-[11px] leading-relaxed px-2 font-medium">
                    Panduan ini belum untuk bayi di bawah 1 tahun. Untuk bayi di bawah 1 tahun, demam perlu dinilai lebih hati-hati. Sebaiknya Bunda berkonsultasi langsung dengan dokter atau fasilitas kesehatan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('LANDING')}
                  className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-display font-semibold rounded-xl text-xs transition shadow-sm"
                >
                  Saya mengerti
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SUHU & CARA UKUR */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in" id="step-3-suhu">
            <div className="mb-2">
              <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
                Berapa suhu tertinggi ananda hari ini?
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Masukkan angka dari termometer. Hasil tetap akan dibaca bersama kondisi ananda, bukan dari suhu saja.
              </p>
            </div>

            {/* Temperature Input Box */}
            <div className="bg-brand-card p-5 rounded-2xl border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-3 text-brand-teal mb-1">
                <Thermometer className="w-5 h-5" />
                <span className="font-display font-bold text-xs text-slate-700">Suhu Tubuh Ananda</span>
              </div>

              <div>
                <div className="relative">
                  <input
                    id="temp-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="Contoh: 38.5"
                    value={wizardData.suhu}
                    onChange={(e) => handleSuhuChange(e.target.value)}
                    className={`w-full bg-slate-50 border focus:bg-white rounded-xl py-3 px-4 font-mono text-base font-bold transition duration-200 outline-none ${
                      suhuError ? 'border-red-300 focus:border-red-500 text-red-800' : 'border-slate-200 focus:border-brand-teal text-slate-800'
                    }`}
                  />
                  <span className="absolute right-4 top-3 text-slate-400 font-display font-semibold text-sm pointer-events-none">°C</span>
                </div>
                {suhuError && (
                  <p className="text-red-600 text-[10px] mt-1.5 leading-relaxed font-semibold">
                    ⚠️ {suhuError}
                  </p>
                )}
              </div>
            </div>

            {/* Site measurement */}
            <div className="bg-brand-card p-5 rounded-2xl border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Bagian Tubuh</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Di mana lokasi pengukuran suhu dilakukan?</h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { 
                    value: 'KETIAK', 
                    label: 'Ketiak', 
                    bg: 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100/50',
                    bgActive: 'bg-emerald-600 border-emerald-700 text-white font-bold shadow-sm'
                  },
                  { 
                    value: 'DAHI', 
                    label: 'Dahi', 
                    bg: 'bg-indigo-50 border-indigo-100 text-indigo-800 hover:bg-indigo-100/50',
                    bgActive: 'bg-indigo-600 border-indigo-700 text-white font-bold shadow-sm',
                    val: 'DAHI' 
                  },
                  { 
                    value: 'TELINGA', 
                    label: 'Telinga', 
                    bg: 'bg-pink-50 border-pink-100 text-pink-800 hover:bg-pink-100/50',
                    bgActive: 'bg-pink-600 border-pink-700 text-white font-bold shadow-sm',
                    val: 'TELINGA' 
                  },
                  { 
                    value: 'REKTAL', 
                    label: 'Rektal', 
                    bg: 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100/50',
                    bgActive: 'bg-amber-600 border-amber-700 text-white font-bold shadow-sm',
                    val: 'REKTAL' 
                  },
                ].map((item) => {
                  const val = (item.val || item.value) as CaraUkurType;
                  const isSelected = wizardData.caraUkur === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWizardData(prev => ({ ...prev, caraUkur: val }))}
                      className={`py-3 px-4 rounded-xl font-display font-bold text-sm border text-center transition-all ${
                        isSelected ? item.bgActive : item.bg
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setWizardData(prev => ({ ...prev, caraUkur: 'TIDAK_YAKIN' }))}
                  className={`col-span-2 py-2.5 px-4 rounded-xl font-display font-semibold text-xs border text-center transition-all ${
                    wizardData.caraUkur === 'TIDAK_YAKIN'
                      ? 'bg-slate-700 border-slate-800 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  Tidak yakin atau lupa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LAMA DEMAM */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in" id="step-4-durasi">
            <div className="mb-2">
              <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
                Sudah berapa lama demamnya?
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Durasi demam penting untuk menilai jenis keluhan penyakit yang diderita ananda.
              </p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-3 text-brand-teal mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-display font-bold text-xs text-slate-700">Pilih Durasi Gejala</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { value: 'KURANG_24_JAM', label: 'Baru hari ini / < 24 jam', desc: 'Demam baru saja mulai hari ini' },
                  { value: '1_2_HARI', label: '1 - 2 hari', desc: 'Demam sudah berlangsung kemarin atau 2 hari' },
                  { value: '3_HARI_LEBIH', label: '3 hari atau lebih', desc: 'Sudah memasuki hari ke-3 atau ke-4' },
                  { value: 'LEBIH_5_HARI_NAIK_TURUN', label: 'Lebih dari 5 hari / naik-turun lama', desc: 'Demam berlangsung lama atau sempat turun lalu naik kembali' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setWizardData(prev => ({ ...prev, lamaDemam: item.value as LamaDemamType }))}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      wizardData.lamaDemam === item.value
                        ? 'bg-brand-teal-light border-brand-teal text-brand-teal-dark shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-display font-bold text-xs">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: RIWAYAT KEJANG */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fade-in" id="step-5-kejang">
            <div className="mb-2">
              <h2 className="font-display font-bold text-slate-800 text-lg leading-snug">
                Apakah ananda pernah kejang saat demam sebelumnya?
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Riwayat kejang demam memerlukan pengawasan ekstra ketika suhu tubuh ananda melonjak tinggi.
              </p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-slate-100/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-3 text-brand-teal mb-1">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-display font-bold text-xs text-slate-700">Riwayat Kejang Demam Sederhana/Kompleks</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { value: 'TIDAK_PERNAH', label: 'Tidak pernah', desc: 'Ananda tidak memiliki riwayat kejang saat demam' },
                  { value: 'PERNAH', label: 'Pernah', desc: 'Ananda pernah mengalami satu/lebih episode kejang demam sebelumnya' },
                  { value: 'TIDAK_YAKIN', label: 'Tidak yakin', desc: 'Bunda ragu-ragu atau belum pernah memperhatikan gejalanya' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setWizardData(prev => ({ ...prev, riwayatKejang: item.value as RiwayatKejangType }))}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      wizardData.riwayatKejang === item.value
                        ? 'bg-brand-teal-light border-brand-teal text-brand-teal-dark shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-display font-bold text-xs font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 border-t border-slate-100 pt-4 bg-brand-cream py-4 shrink-0">
        {/* Usia exclusion blocks the next button completely */}
        {!(currentStep === 2 && wizardData.usiaTahun !== '' && getAgeInMonths() < 12) && (
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="w-1/3 py-3 border border-slate-200 hover:border-slate-300 rounded-xl font-display font-semibold text-xs text-slate-500 bg-white transition duration-200 flex items-center justify-center gap-1.5"
              >
                Kembali
              </button>
            )}
            
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={handleNext}
              className={`py-3 rounded-xl font-display font-bold text-xs text-white transition duration-200 flex items-center justify-center gap-1.5 shadow-sm ${
                currentStep > 1 ? 'w-2/3' : 'w-full'
              } ${
                canGoNext() 
                  ? 'bg-brand-teal hover:bg-brand-teal-dark cursor-pointer' 
                  : 'bg-slate-300 text-slate-100 cursor-not-allowed'
              }`}
            >
              <span>{currentStep === 5 ? 'Selesai & Lihat Hasil' : 'Lanjut'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
