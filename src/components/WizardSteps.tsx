/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Clock,
  RotateCcw,
  Activity,
  Check,
  Scale,
  Calendar,
  Baby,
  HelpCircle
} from 'lucide-react';
import { WizardData, ScreenType } from '../types';

interface WizardStepsProps {
  lang: 'id' | 'en';
  onNavigate: (screen: ScreenType) => void;
  wizardData: WizardData;
  setWizardData: Dispatch<SetStateAction<WizardData>>;
  onCompleteWizard: () => void;
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
}

export default function WizardSteps({ 
  lang,
  onNavigate, 
  wizardData, 
  setWizardData, 
  onCompleteWizard,
  currentStep,
  setCurrentStep,
}: WizardStepsProps) {
  const [errorText, setErrorText] = useState<string | null>(null);

  // States for weight estimator tool
  const [showEstimator, setShowEstimator] = useState(false);
  const [estCategory, setEstCategory] = useState<'INFANT' | 'TODDLER' | 'CHILD'>('INFANT');
  const [estValue, setEstValue] = useState<number>(3); // months or years

  // Batuk/Sesak Tap Counter States
  const [tapCount, setTapCount] = useState<number>(0);
  const [timerCount, setTimerCount] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const selectedModule = wizardData.selectedModule;

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerCount <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle auto finish when timer reaches 0
  useEffect(() => {
    if (timerCount === 0 && tapCount > 0) {
      setWizardData(d => ({ ...d, bsLajuNapas: tapCount }));
      // Auto move after slight delay
      const t = setTimeout(() => {
        handleFinishCounter(tapCount);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [timerCount]);

  if (!selectedModule) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600 font-semibold">
          {lang === 'id' ? 'Silakan pilih gejala terlebih dahulu.' : 'Please select a symptom first.'}
        </p>
        <button 
          onClick={() => onNavigate('LANDING')}
          className="px-6 py-2.5 bg-[#5FB7B9] text-white rounded-xl"
        >
          {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Max Steps config
  const maxSteps = selectedModule === 'BATUK_SESAK' ? 5 : 4;

  // Evaluation: Is there a RED (Gawat Darurat) danger sign selected?
  const hasActiveDangerSign = (): boolean => {
    if (selectedModule === 'DEMAM') {
      const { kejangAktif, kakuKuduk, kesadaranMenurun, bintikMerah } = wizardData.demamTandaBahaya;
      return kejangAktif === 'ADA' || kakuKuduk === 'ADA' || kesadaranMenurun === 'ADA' || bintikMerah === 'ADA';
    } else if (selectedModule === 'MUNTAH_DIARE') {
      const { letargis, mataCekung, muntahSemua, tidakPipis } = wizardData.mdTandaBahaya;
      return letargis === 'ADA' || mataCekung === 'ADA' || muntahSemua === 'ADA' || tidakPipis === 'ADA';
    } else if (selectedModule === 'BATUK_SESAK') {
      const { sianosis, stridor, tarikanDindingDada, tidakMauMinum } = wizardData.bsTandaBahaya;
      return sianosis === 'ADA' || stridor === 'ADA' || tarikanDindingDada === 'ADA' || tidakMauMinum === 'ADA';
    }
    return false;
  };

  const isRedTriggered = hasActiveDangerSign();

  // If Danger is found, show full screen Layar Merah Penuh instantly
  if (isRedTriggered) {
    return (
      <div className="fixed inset-0 bg-red-650 z-[9999] flex flex-col items-center justify-center text-center p-6 sm:p-12 text-white animate-fade-in" id="wizard-emergency-screen">
        <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mb-2 border border-white/20 select-none animate-bounce">
            ⚠️
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight leading-normal max-w-xl text-center">
            {lang === 'id' ? '⚠️ SEGERA BAWA ANANDA KE IGD.' : '⚠️ IMMEDIATELY TAKE YOUR CHILD TO THE EMERGENCY ROOM.'}
          </h1>
          <p className="text-sm sm:text-base text-red-100 leading-relaxed font-semibold max-w-lg text-center bg-black/10 p-5 rounded-2xl border border-white/5">
            {lang === 'id' 
              ? 'Ditemukan tanda bahaya gawat darurat medis pada pemeriksaan ananda. Mohon jangan tunda dan segera menuju ke IGD rumah sakit terdekat untuk pertolongan medis.' 
              : "Emergency alert active. Your child shows signs of acute physiological crisis. Go to the nearest Hospital ER department immediately without waiting."}
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full p-2 justify-center">
            <button
              onClick={() => {
                // Clear all danger signs to non-emergency state
                setWizardData(prev => ({
                  ...prev,
                  demamTandaBahaya: { kejangAktif: null, kakuKuduk: null, kesadaranMenurun: null, bintikMerah: null },
                  mdTandaBahaya: { letargis: null, mataCekung: null, muntahSemua: null, tidakPipis: null },
                  bsTandaBahaya: { sianosis: null, stridor: null, tarikanDindingDada: null, tidakMauMinum: null }
                }));
                setCurrentStep(1);
                onNavigate('LANDING');
              }}
              className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-white text-rose-700 font-display font-black text-xs sm:text-sm shadow-md transition transform hover:scale-105 duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 shrink-0 text-rose-750" />
              <span>{lang === 'id' ? 'Ulangi Skrining & Reset' : 'Return to Home & Restart'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Weight Estimation logic based on APLS
  const handleCalculateEstimatedWeight = () => {
    let estResult = 0;
    if (estCategory === 'INFANT') {
      // 1-12 Months: (months * 0.5) + 4
      estResult = (estValue * 0.5) + 4;
    } else if (estCategory === 'TODDLER') {
      // 1-5 Years: (years * 2) + 8
      estResult = (estValue * 2) + 8;
    } else if (estCategory === 'CHILD') {
      // 6-12 Years: (years * 3) + 7
      estResult = (estValue * 3) + 7;
    }

    // Assign automatically to the target module's weight parameter
    const numericStr = estResult.toString();
    setWizardData(prev => {
      if (selectedModule === 'DEMAM') {
        return { ...prev, demamBeratBadan: numericStr };
      } else if (selectedModule === 'MUNTAH_DIARE') {
        return { ...prev, mdBeratBadan: numericStr };
      } else if (selectedModule === 'BATUK_SESAK') {
        return { ...prev, bsBeratBadan: numericStr };
      }
      return prev;
    });

    setShowEstimator(false);
  };

  // VALIDATORS TO CONTROL STEP TRANSLATIONS
  const canGoNextStep = (): boolean => {
    if (currentStep === 1) {
      // step 1 danger screening must be fully loaded or answered.
      if (selectedModule === 'DEMAM') {
        const { kejangAktif, kakuKuduk, kesadaranMenurun, bintikMerah } = wizardData.demamTandaBahaya;
        return kejangAktif !== null && kakuKuduk !== null && kesadaranMenurun !== null && bintikMerah !== null;
      }
      if (selectedModule === 'MUNTAH_DIARE') {
        const { letargis, mataCekung, muntahSemua, tidakPipis } = wizardData.mdTandaBahaya;
        return letargis !== null && mataCekung !== null && muntahSemua !== null && tidakPipis !== null;
      }
      if (selectedModule === 'BATUK_SESAK') {
        const { sianosis, stridor, tarikanDindingDada, tidakMauMinum } = wizardData.bsTandaBahaya;
        return sianosis !== null && stridor !== null && tarikanDindingDada !== null && tidakMauMinum !== null;
      }
    }

    if (selectedModule === 'DEMAM') {
      if (currentStep === 2) {
        return wizardData.demamUsiaGroup !== null && wizardData.demamBeratBadan.trim() !== '';
      }
      if (currentStep === 3) {
        const temp = parseFloat(wizardData.demamSuhu);
        return !isNaN(temp) && temp >= 34 && temp <= 43 && wizardData.demamLama !== null;
      }
      if (currentStep === 4) {
        return wizardData.demamRiwayatKejang !== null && wizardData.demamTerakhirObat !== null;
      }
    }

    if (selectedModule === 'MUNTAH_DIARE') {
      if (currentStep === 2) {
        // Must fill in Bulan, Tahun and Berat Badan
        const hasAge = wizardData.mdUsiaTahun.trim() !== '' || wizardData.mdUsiaBulan.trim() !== '';
        return hasAge && wizardData.mdBeratBadan.trim() !== '';
      }
      if (currentStep === 3) {
        return wizardData.mdDurasi !== null && wizardData.mdFrekuensi !== null;
      }
      if (currentStep === 4) {
        const totalMonths = (parseInt(wizardData.mdUsiaTahun) || 0) * 12 + (parseInt(wizardData.mdUsiaBulan) || 0);
        if (totalMonths < 18) {
          return wizardData.mdResponsMinum !== null && wizardData.mdKondisiMata !== null && wizardData.mdUbunUbun !== null;
        }
        return wizardData.mdResponsMinum !== null && wizardData.mdKondisiMata !== null;
      }
    }

    if (selectedModule === 'BATUK_SESAK') {
      if (currentStep === 2) {
        return wizardData.bsUsiaGroup !== null && wizardData.bsBeratBadan.trim() !== '';
      }
      if (currentStep === 3) {
        return wizardData.bsDurasi !== null;
      }
      if (currentStep === 4) {
        return wizardData.bsLajuNapas > 0;
      }
      if (currentStep === 5) {
        return wizardData.bsSuaraMengi !== null;
      }
    }

    return false;
  };

  const handleNextStep = () => {
    if (!canGoNextStep()) {
      if (currentStep === 1) {
        setErrorText(lang === 'id' ? 'Mohon jawab tanda bahaya atau klik tombol Hijau di bawah jika tidak ada sama sekali.' : 'Please answer danger sign checks or press the green safety button.');
      } else {
        setErrorText(lang === 'id' ? 'Mohon lengkapi seluruh isian data pada langkah ini sebelum melanjutkan.' : 'Please fill all fields in this step to advance.');
      }
      return;
    }
    setErrorText(null);

    if (currentStep === maxSteps) {
      onCompleteWizard();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setErrorText(null);
    if (currentStep === 1) {
      onNavigate('LANDING');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  // TAP COUNTER COUPLER
  const handleTap = () => {
    if (!isTimerRunning && timerCount === 60) {
      setIsTimerRunning(true);
    }
    if (timerCount <= 0) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);
    setWizardData(d => ({ ...d, bsLajuNapas: newCount }));
  };

  const handleResetCounter = () => {
    setIsTimerRunning(false);
    setTimerCount(60);
    setTapCount(0);
    setWizardData(d => ({ ...d, bsLajuNapas: 0 }));
  };

  const handleFinishCounter = (finalCount: number) => {
    setIsTimerRunning(false);
    setWizardData(d => ({ ...d, bsLajuNapas: finalCount }));
    // Move to next step (mengi evaluation)
    setCurrentStep(5);
  };

  const triggerNoDangerSigns = () => {
    setErrorText(null);
    if (selectedModule === 'DEMAM') {
      setWizardData(prev => ({
        ...prev,
        demamTandaBahaya: { kejangAktif: 'TIDAK', kakuKuduk: 'TIDAK', kesadaranMenurun: 'TIDAK', bintikMerah: 'TIDAK' }
      }));
    } else if (selectedModule === 'MUNTAH_DIARE') {
      setWizardData(prev => ({
        ...prev,
        mdTandaBahaya: { letargis: 'TIDAK', mataCekung: 'TIDAK', muntahSemua: 'TIDAK', tidakPipis: 'TIDAK' }
      }));
    } else if (selectedModule === 'BATUK_SESAK') {
      setWizardData(prev => ({
        ...prev,
        bsTandaBahaya: { sianosis: 'TIDAK', stridor: 'TIDAK', tarikanDindingDada: 'TIDAK', tidakMauMinum: 'TIDAK' }
      }));
    }
    // Advance to step 2 automatically
    setCurrentStep(2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10 flex flex-col justify-start text-center animate-fade-in space-y-6" id="wizard-container">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 select-none">
        <button 
          onClick={handleBackStep}
          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 transition duration-150 cursor-pointer text-slate-600 flex items-center justify-center shadow-3xs"
          id="wizard-back-btn"
        >
          <ChevronLeft className="w-5 h-5 shrink-0" />
        </button>
        <div>
          <span className="font-display font-black text-[#5FB7B9] text-xs sm:text-sm uppercase tracking-widest block text-center">
            {selectedModule === 'DEMAM' ? (lang === 'id' ? 'SKRINING DEMAM' : 'FEVER CHECK') :
             selectedModule === 'MUNTAH_DIARE' ? (lang === 'id' ? 'SKRINING MUNTAH & DIARE' : 'VOMITING & DIARRHEA') :
             (lang === 'id' ? 'SKRINING BATUK & SESAK' : 'BREATHING SCREEN')}
          </span>
          <span className="text-xs font-semibold text-slate-400 block text-center mt-0.5">
            {lang === 'id' ? `Langkah ${currentStep} dari ${maxSteps}` : `Step ${currentStep} of ${maxSteps}`}
          </span>
        </div>
        <div className="w-10 h-10 opacity-0"></div>
      </div>

      {/* ERROR BANNER */}
      {errorText && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm font-semibold text-left animate-fade-in" id="wizard-error-banner">
          <Info className="w-4.5 h-4.5 text-red-600 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* INLINE WEIGHT ESTIMATION POPUP/TOOL */}
      {showEstimator && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left space-y-5 shadow-sm animate-fade-in select-none">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-teal-600" />
            <h4 className="font-display font-black text-slate-800 text-sm sm:text-base uppercase tracking-wide">
              {lang === 'id' ? 'Estimator Berat Badan (Formula APLS)' : 'APLS Body Weight Estimator'}
            </h4>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            {lang === 'id' 
              ? 'Formula Advanced Pediatric Life Support (APLS) mengestimasi berat badan standar sesuai kelompok umurnya.'
              : 'Estimates a typical therapeutic baseline weight using official international pediatric formulations.'}
          </p>

          {/* Age Category Selector Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'INFANT', label: lang === 'id' ? '1-12 bulan' : '1-12 m' },
              { id: 'TODDLER', label: lang === 'id' ? '1-5 tahun' : '1-5 y' },
              { id: 'CHILD', label: lang === 'id' ? '6-12 tahun' : '6-12 y' }
            ].map(cat => (
              <button 
                type="button"
                key={cat.id}
                onClick={() => {
                  setEstCategory(cat.id as any);
                  setEstValue(cat.id === 'INFANT' ? 6 : cat.id === 'TODDLER' ? 3 : 8);
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black text-center border cursor-pointer ${
                  estCategory === cat.id 
                    ? 'border-[#5FB7B9] bg-[#E8F6F6] text-[#3E8E91]' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Slider for value */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black text-slate-600">
              <span>{lang === 'id' ? 'Tentukan Usia:' : 'Set Age Value:'}</span>
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-[13px] font-mono leading-none">
                {estValue} {estCategory === 'INFANT' ? (lang === 'id' ? 'Bulan' : 'Months') : (lang === 'id' ? 'Tahun' : 'Years')}
              </span>
            </div>
            <input 
              type="range"
              min={estCategory === 'INFANT' ? 1 : estCategory === 'TODDLER' ? 1 : 6}
              max={estCategory === 'INFANT' ? 12 : estCategory === 'TODDLER' ? 5 : 12}
              value={estValue}
              onChange={(e) => setEstValue(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5FB7B9]"
            />
          </div>

          {/* Live formula display */}
          <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">{lang === 'id' ? 'Estimasi Berat Badan:' : 'Estimated Weight:'}</span>
            <span className="font-display font-black text-slate-800 text-sm">
              {estCategory === 'INFANT' ? `(${estValue} × 0.5) + 4 = ` : estCategory === 'TODDLER' ? `(${estValue} × 2) + 8 = ` : `(${estValue} × 3) + 7 = `}
              <span className="text-emerald-700">
                {estCategory === 'INFANT' ? (estValue * 0.5) + 4 : estCategory === 'TODDLER' ? (estValue * 2) + 8 : (estValue * 3) + 7} kg
              </span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button 
              type="button"
              onClick={() => setShowEstimator(false)}
              className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-350 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button 
              type="button"
              onClick={handleCalculateEstimatedWeight}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-3xs"
            >
              {lang === 'id' ? 'Terapkan Estimasi' : 'Apply Estimated'}
            </button>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------------- */}
      {/* 1. SECTOR: MUNTAH / DIARE */}
      {/* ----------------------------------------------------------------- */}
      {selectedModule === 'MUNTAH_DIARE' && (
        <div className="space-y-6 flex flex-col text-left">
          
          {/* STEP 1: DANGER SIGNS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 block select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Evaluasi Tanda Bahaya pada Anak' : 'Danger Signs Evaluation'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md mx-auto">
                  {lang === 'id' ? 'Mohon tinjau secara teliti kondisi di bawah ini satu-persatu.' : 'Check the options. Tapping any danger sign triggers an immediate ER warning safety shield.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { id: 'letargis', title: '1. Letargis / Tidak Sadar', desc: lang === 'id' ? 'Anak tergeletak lemas luar biasa, tidak merespons panggillan atau sentuhan, sangat sulit dibangunkan.' : 'Lethargic, floppy, completely unresponsive or extremely floppy.' },
                  { id: 'mataCekung', title: '2. Mata Sangat Cekung', desc: lang === 'id' ? 'Mata cekung parah (cowong) yang tampak kontras, atau kering tanpa air mata saat menangis.' : 'Sunken eyes that develop deep dark folds compared to normal look.' },
                  { id: 'muntahSemua', title: '3. Muntah Setiap Minum', desc: lang === 'id' ? 'Tidak bisa kemasukan asupan makanan/ASI/Formula sama sekali. Semua yang ditelan dimuntahkan kembali.' : 'Inability to keep liquids down. Child immediately vomits back everything that enters.' },
                  { id: 'tidakPipis', title: '4. Tidak Pipis > 8 Jam', desc: lang === 'id' ? 'Popok kering terus setelah 8 jam lebih, atau anak tidak buang air kecil sama sekali sepanjang hari.' : 'Dry diapers or absolute lack of urine output for more than 8 hours.' }
                ].map((item) => {
                  const isSelected = wizardData.mdTandaBahaya[item.id as keyof typeof wizardData.mdTandaBahaya] === 'ADA';
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setWizardData(prev => ({
                          ...prev,
                          mdTandaBahaya: {
                            ...prev.mdTandaBahaya,
                            [item.id]: isSelected ? 'TIDAK' : 'ADA'
                          }
                        }));
                      }}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition duration-150 select-none flex flex-col justify-between space-y-3 ${
                        isSelected 
                          ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`font-display font-black text-xs sm:text-sm block ${isSelected ? 'text-red-750' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <p className={`text-[10px] sm:text-xs leading-relaxed font-semibold block ${isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono ${
                          isSelected ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isSelected ? (lang === 'id' ? 'ADA 🔴' : 'YES 🔴') : (lang === 'id' ? 'TIDAK ADA' : 'NONE')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Big Green Safety Confirmation Button */}
              <button 
                type="button"
                onClick={triggerNoDangerSigns}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-black text-xs sm:text-sm rounded-2xl shadow-md transition duration-150 text-center flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Check className="w-5 h-5 text-white stroke-[3px]" />
                <span>{lang === 'id' ? 'TIDAK ADA SAMA SEKALI' : 'NONE OF THESE ARE PRESENT'}</span>
              </button>
            </div>
          )}

          {/* STEP 2: AGE & WEIGHT */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Berapa Usia & Berat Badan Ananda?' : 'Age & Body Weight of Your Child'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                  {lang === 'id' ? 'Dibutuhkan untuk penyesuaian evaluasi keadaaan kelopak mata dan ubun-ubun anak.' : 'Crucial indicators to customize rehydration fluids.'}
                </p>
              </div>

              {/* Age block */}
              <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-3 shadow-3xs">
                <label className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#5FB7B9]" />
                  <span>{lang === 'id' ? 'A. Isi Umur atau Usia Anak:' : 'A. Set Child Age:'}</span>
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      id="md-year-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={wizardData.mdUsiaTahun}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setWizardData(d => ({ ...d, mdUsiaTahun: val }));
                      }}
                      className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-3 pr-16 text-slate-800 outline-none transition font-extrabold text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase text-slate-400 select-none tracking-wider">
                      {lang === 'id' ? 'Tahun' : 'Years'}
                    </span>
                  </div>

                  <div className="relative">
                    <input 
                      id="md-month-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={wizardData.mdUsiaBulan}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setWizardData(d => ({ ...d, mdUsiaBulan: val }));
                      }}
                      className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-3 pr-16 text-slate-800 outline-none transition font-extrabold text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase text-slate-400 select-none tracking-wider">
                      {lang === 'id' ? 'Bulan' : 'Months'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weight Block */}
              <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-3.5 shadow-3xs">
                <label className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5 select-none">
                  <Scale className="w-4.5 h-4.5 text-[#5FB7B9]" />
                  <span>{lang === 'id' ? 'B. Berat Badan Anak Presisi:' : 'B. Child Weight Basis:'}</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-48 relative select-none">
                    <input 
                      id="md-weight-input"
                      type="text" 
                      inputMode="decimal"
                      placeholder="Contoh: 12.5"
                      value={wizardData.mdBeratBadan}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                          setWizardData(d => ({ ...d, mdBeratBadan: val }));
                        }
                      }}
                      className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-4 pr-12 text-slate-800 outline-none transition font-extrabold text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 uppercase tracking-wider select-none">kg</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      // Seed initial values in estimator based on existing fields
                      const yrs = parseInt(wizardData.mdUsiaTahun) || 0;
                      const mths = parseInt(wizardData.mdUsiaBulan) || 0;
                      if (yrs >= 6) {
                        setEstCategory('CHILD');
                        setEstValue(Math.min(12, yrs));
                      } else if (yrs >= 1) {
                        setEstCategory('TODDLER');
                        setEstValue(Math.min(5, yrs));
                      } else {
                        setEstCategory('INFANT');
                        setEstValue(mths || 6);
                      }
                      setShowEstimator(!showEstimator);
                    }}
                    className="text-xs font-black text-[#5FB7B9] hover:text-[#3E8E91] underline cursor-pointer select-none py-1 block leading-none self-center"
                  >
                    💡 {lang === 'id' ? 'Lupa Berat Badan? Hitung Estimasi APLS' : 'Forgot weight? Use APLS baseline'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: DURASI & FREKUENSI */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Durasi & Frekuensi Gejala' : 'Symptom Duration & Frequency'}
                </h3>
              </div>

              {/* A. Lama Kejadian */}
              <div className="space-y-3 flex flex-col">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'A. Berapa Lama Anak Muntah / Diare?' : 'A. How long has this occurred?'}
                </span>
                
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { id: 'KURANG_5_HARI', label: lang === 'id' ? 'Akut (< 5 hari)' : 'Acute (< 5 days)' },
                    { id: 'LEBIH_5_HARI', label: lang === 'id' ? 'Ketetapan Kronis (≥ 5 hari)' : 'Chronic (≥ 5 days)' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, mdDurasi: opt.id as any }))}
                      className={`p-5 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center h-24 select-none ${
                        wizardData.mdDurasi === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-black">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* B. Frekuensi */}
              <div className="space-y-3 flex flex-col pt-3">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'B. Seberapa Sering BAB/Muntah dalam 24 Jam Terakhir?' : 'B. 24h Pooping/Vomiting Frequency:'}
                </span>

                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { id: 'JARANG', label: lang === 'id' ? 'Jarang (1 - 3 kali)' : 'Mild (1 - 3 times)' },
                    { id: 'SERING', label: lang === 'id' ? 'Sering (4 kali atau lebih)' : 'Severe (4+ times)' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, mdFrekuensi: opt.id as any }))}
                      className={`p-5 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center h-24 select-none ${
                        wizardData.mdFrekuensi === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-black">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: DEHIDRASI / RESPONS MINUM + MATA (+ UBUN UBUN IF <18M) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Pantau Respons Refleks & Tanda Dehidrasi' : 'Hydration Index Evaluation'}
                </h3>
              </div>

              {/* 1) Respons Minum */}
              <div className="space-y-3 flex flex-col">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'A. Bagaimana Respons Minum Anak saat Diberi Air/ASI?' : 'A. Drinking responsiveness:'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'NORMAL', label: lang === 'id' ? 'Normal / Haus Biasa' : 'Normal / Typical Thirst' },
                    { id: 'HAUS', label: lang === 'id' ? 'Sangat Lahap (Sangat Haus)' : 'Greedy, Eager Thirst' },
                    { id: 'MALAS_MINUM', label: lang === 'id' ? 'Malas Minum atau Mogok' : 'Floppy, Unable/Poor Drinking' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, mdResponsMinum: opt.id as any }))}
                      className={`p-4 rounded-2xl border text-center cursor-pointer font-bold text-xs select-none transition duration-150 flex items-center justify-center min-h-[64px] ${
                        wizardData.mdResponsMinum === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91]' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="font-black leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2) Kondisi Mata */}
              <div className="space-y-3 flex flex-col pt-3">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'B. Kondisi Kelopak Mata Anak:' : 'B. Eye and Tear duct context:'}
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'NORMAL', label: lang === 'id' ? 'Normal / Berair Alami' : 'Normal / Natural Moisture' },
                    { id: 'CEKUNG', label: lang === 'id' ? 'Cekung Sayu / Keriput' : 'Sunken / Dull crease' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, mdKondisiMata: opt.id as any }))}
                      className={`p-4 rounded-2xl border text-center cursor-pointer font-bold text-xs select-none transition duration-150 flex items-center justify-center min-h-[64px] ${
                        wizardData.mdKondisiMata === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91]' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="font-black leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3) Ubun-Ubun (Hanya jika usia < 18 Bulan) */}
              {(() => {
                const totalMonths = (parseInt(wizardData.mdUsiaTahun) || 0) * 12 + (parseInt(wizardData.mdUsiaBulan) || 0);
                if (totalMonths < 18) {
                  return (
                    <div className="space-y-3 flex flex-col pt-3 border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-2 select-none">
                        <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide">
                          {lang === 'id' ? 'C. Ketegangan Ubun-Ubun (Anak < 18 Bulan):' : 'C. Fontanelle tension (Child < 18 Months):'}
                        </span>
                        
                        <div className="group relative">
                          <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-white text-[10px] sm:text-xs leading-relaxed p-3.5 rounded-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition z-50 shadow-md">
                            {lang === 'id' 
                              ? 'Tip Raba: Pangku anak dengan rileks dan raba halus ubun-ubun besarnya di puncak kepala. Rasakan apakah terasa datar normal atau cekung berlubang ke dalam.'
                              : 'Tip: Touch the top-front soft spot softly while child is upright and calm. Feel if it is flat/normal or depressively hollow.'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'NORMAL', label: lang === 'id' ? 'Normal (Datar biasa)' : 'Normal (Flat baseline)' },
                          { id: 'CEKUNG', label: lang === 'id' ? 'Ubun-Ubun Cekung dalam' : 'Depressed / Sunken Fontanelle' }
                        ].map(opt => (
                          <div 
                            key={opt.id}
                            onClick={() => setWizardData(d => ({ ...d, mdUbunUbun: opt.id as any }))}
                            className={`p-4 rounded-2xl border text-center cursor-pointer font-bold text-xs select-none transition duration-150 flex items-center justify-center min-h-[64px] ${
                              wizardData.mdUbunUbun === opt.id 
                                ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91]' 
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="font-black leading-snug">{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            </div>
          )}

        </div>
      )}


      {/* ----------------------------------------------------------------- */}
      {/* 2. SECTOR: BATUK / SESAK */}
      {/* ----------------------------------------------------------------- */}
      {selectedModule === 'BATUK_SESAK' && (
        <div className="space-y-6 flex flex-col text-left">
          
          {/* STEP 1: DANGER SIGNS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 block select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Evaluasi Tanda Bahaya Respirologi' : 'Respiratory Acute Danger screening'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md mx-auto">
                  {lang === 'id' ? 'Tinjau tanda klinis kegawatan pernapasan akut anak di bawah:' : 'Select any active indicators. Any chosen red signs trigger the emergency ER warning shield.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { id: 'sianosis', title: '1. Bibir Kebiruan (Sianosis)', desc: lang === 'id' ? 'Mulut, lidah, gusi, atau kuku anak tampak membiru pucat atau keabu-abuan akibat kekurangan oksigen.' : 'Cyanosis. Slate-gray or bluish hue on oral mucosa, lips, or fingernails.' },
                  { id: 'stridor', title: '2. Mengorok Kasar (Stridor)', desc: lang === 'id' ? 'Suara tiupan ngorok parau keras, bernada serak-kasar setiap kali anak menarik napas padahal posisi tenang.' : 'Inspiratory stridor. Coarse crowing whistles drawn on inhalation.' },
                  { id: 'tarikanDindingDada', title: '3. Tarikan Dada Bawah Sangat Kuat', desc: lang === 'id' ? 'Dinding dada bawah atau sekat ulu hati tertarik melengkung melekuk ke dalam secara ekstrem saat membuang napas.' : 'Deep lower chest wall retractions drawn in heavily.' },
                  { id: 'tidakMauMinum', title: '4. Tidak Bisa / Menolak Minum', desc: lang === 'id' ? 'Menolak nenen/botol susu dan tidak sanggup menelan cairan sama sekali akibat kelelahan bernapas.' : 'Absolute refusal, floppy, or physiological inability to swallow fluids.' }
                ].map((item) => {
                  const isSelected = wizardData.bsTandaBahaya[item.id as keyof typeof wizardData.bsTandaBahaya] === 'ADA';
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setWizardData(prev => ({
                          ...prev,
                          bsTandaBahaya: {
                            ...prev.bsTandaBahaya,
                            [item.id]: isSelected ? 'TIDAK' : 'ADA'
                          }
                        }));
                      }}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition duration-150 select-none flex flex-col justify-between space-y-3 ${
                        isSelected 
                          ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`font-display font-black text-xs sm:text-sm block ${isSelected ? 'text-red-750' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <p className={`text-[10px] sm:text-xs leading-relaxed font-semibold block ${isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono ${
                          isSelected ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isSelected ? (lang === 'id' ? 'ADA 🔴' : 'YES 🔴') : (lang === 'id' ? 'TIDAK ADA' : 'NONE')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Big Green Safety Confirmation Button */}
              <button 
                type="button"
                onClick={triggerNoDangerSigns}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-black text-xs sm:text-sm rounded-2xl shadow-md transition duration-150 text-center flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Check className="w-5 h-5 text-white stroke-[3px]" />
                <span>{lang === 'id' ? 'TIDAK ADA SAMA SEKALI' : 'NONE OF THESE ARE PRESENT'}</span>
              </button>
            </div>
          )}

          {/* STEP 2: AGE CATEGORY & WEIGHT */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Berapa Usia & Berat Badan Ananda?' : 'Age & Weight of Your Child'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-sm mx-autoColor">
                  {lang === 'id' ? 'Usia menentukan batas ambang normal napas cepat (Takipnea).' : 'Age parameters govern threshold definitions for tachypnea.'}
                </p>
              </div>

              {/* Age Categories represented as cards */}
              <div className="space-y-3 flex flex-col">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'A. Pilih Kelompok Usia Anak:' : 'A. Choose Age bracket:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'KURANG_2_BULAN', label: lang === 'id' ? 'Di bawah 2 Bulan' : 'Under 2 Months', icon: '👶' },
                    { id: '2_11_BULAN', label: lang === 'id' ? '2 s.d. 11 Bulan' : '2 to 11 Months', icon: '🍼' },
                    { id: '1_5_TAHUN', label: lang === 'id' ? '1 s.d. 5 Tahun' : '1 to 5 Years', icon: '🧸' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, bsUsiaGroup: opt.id as any }))}
                      className={`p-5 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center space-y-2 select-none h-24 ${
                        wizardData.bsUsiaGroup === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91]' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-black">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Block */}
              <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-3 shadow-3xs">
                <label className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5 select-none">
                  <Scale className="w-4.5 h-4.5 text-[#5FB7B9]" />
                  <span>{lang === 'id' ? 'B. Berat Badan Anak Presisi:' : 'B. Precision weight basis:'}</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-48 relative select-none">
                    <input 
                      id="bs-weight-input"
                      type="text" 
                      inputMode="decimal"
                      placeholder="Contoh: 12.5"
                      value={wizardData.bsBeratBadan}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                          setWizardData(d => ({ ...d, bsBeratBadan: val }));
                        }
                      }}
                      className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-4 pr-12 text-slate-800 outline-none transition font-extrabold text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 shortcut-kg uppercase select-none">kg</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (wizardData.bsUsiaGroup === '1_5_TAHUN') {
                        setEstCategory('TODDLER');
                        setEstValue(3);
                      } else if (wizardData.bsUsiaGroup === '2_11_BULAN') {
                        setEstCategory('INFANT');
                        setEstValue(6);
                      } else {
                        setEstCategory('INFANT');
                        setEstValue(1);
                      }
                      setShowEstimator(!showEstimator);
                    }}
                    className="text-xs font-black text-[#5FB7B9] hover:text-[#3E8E91] underline cursor-pointer select-none py-1 block leading-none self-center"
                  >
                    💡 {lang === 'id' ? 'Lupa Berat Badan? Hitung Estimasi APLS' : 'Forgot weight? Estimate with APLS'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: DURASI / LAMA BATUK */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in flex flex-col items-center">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Berapa Lama Ananda Batuk / Sesak?' : 'Coughing & Breathing Illness Duration'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mt-4 text-center">
                {[
                  { id: 'KURANG_14_HARI', label: lang === 'id' ? 'Batuk Akut (< 14 hari)' : 'Acute Cough (< 14 days)' },
                  { id: 'LEBIH_14_HARI', label: lang === 'id' ? 'Ketetapan Kronis (≥ 14 hari)' : 'Chronic Cough (≥ 14 days)' }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => setWizardData(d => ({ ...d, bsDurasi: opt.id as any }))}
                    className={`p-6 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center h-28 select-none ${
                      wizardData.bsDurasi === opt.id 
                        ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black">{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: INTERACTIVE BREATH COUNTER */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in flex flex-col items-center">
              <div className="text-center space-y-1 select-none max-w-md">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl flex items-center justify-center gap-1.5">
                  <Activity className="w-5 h-5 text-blue-500 animate-pulse animate-duration-500" />
                  <span>{lang === 'id' ? 'Alat Hitung Tarikan Napas' : 'Breathing Tap Counter tool'}</span>
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                  {lang === 'id' 
                    ? 'Tip: Buka baju anak agar perut/dada terlihat. Ketuk tombol biru tepat SATU KALI setiap kali perut anak mengembang menarik napas.' 
                    : 'Instruction: Keep child relaxed. Tap the blue pad EXACTLY ONCE at every breath drawn.'}
                </p>
              </div>

              {/* Visualization Grid Panel */}
              <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-md grid grid-cols-3 gap-4 items-center justify-center select-none shadow-3xs">
                
                {/* 1. Timer */}
                <div className="text-center space-y-1">
                  <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block">{lang === 'id' ? 'Timer' : 'STATED TIME'}</span>
                  <span className="font-mono text-lg sm:text-xl font-black text-slate-700 flex items-center gap-1 justify-center">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    {timerCount}s
                  </span>
                </div>

                {/* 2. Respiration lung indicator */}
                <div className="flex justify-center items-center">
                  <div className={`relative flex items-center justify-center w-14 h-14 bg-white rounded-full border border-blue-200 shadow-3xs ${
                    isTimerRunning ? 'animate-pulse' : ''
                  }`}>
                    <div className={`absolute inset-1 bg-blue-400 rounded-full opacity-10 ${
                      isTimerRunning ? 'animate-ping duration-1000' : ''
                    }`} />
                    <span className="text-2xl select-none" role="img" aria-label="lungs">🫁</span>
                  </div>
                </div>

                {/* 3. Rate Display */}
                <div className="text-center space-y-1">
                  <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block">{lang === 'id' ? 'Hasil Laju' : 'BREATHS RATE'}</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-blue-700 block">
                    {wizardData.bsLajuNapas} <span className="text-[10px] font-semibold text-slate-500">x/m</span>
                  </span>
                </div>

              </div>

              {/* Tapping Trigger pad */}
              <div className="w-full max-w-sm">
                <button
                  type="button"
                  onClick={handleTap}
                  className="w-full h-32 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition rounded-3xl shadow-md border-b-4 border-blue-900 flex flex-col justify-center items-center gap-1.5 cursor-pointer text-white select-none relative overflow-hidden"
                >
                  <span className="font-display font-black text-xl sm:text-2xl leading-none">{lang === 'id' ? 'KETUK DI SINI' : 'TAP HERE'}</span>
                  <span className="text-[10.5px] font-bold text-blue-100 uppercase tracking-widest leading-none">
                    {lang === 'id' ? `TERKUMPUL: ${tapCount} Tarikan` : `COLLECTED: ${tapCount} Breaths`}
                  </span>
                </button>
              </div>

              {/* Controls bar */}
              <div className="flex gap-4 w-full max-w-sm justify-between pt-1 font-semibold text-xs">
                <button 
                  type="button"
                  onClick={handleResetCounter}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'id' ? 'Ulang' : 'Reset'}</span>
                </button>

                {tapCount > 0 && isTimerRunning && (
                  <button 
                    type="button"
                    onClick={() => handleFinishCounter(tapCount)}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-3xs text-xs font-black transition"
                  >
                    <span>{lang === 'id' ? 'Selesai Lebih Cepat' : 'Finish Early'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: WHEEZING */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in flex flex-col items-center">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Apakah Terdengar Mengi?' : 'Is There Wheezing Audible?'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md mx-auto">
                  {lang === 'id' ? 'Suara penciutan halus bernada sedikit melingking ("ngiiing/uit-uit") saat anak membuang napas.' : 'A high-pitched whistling or whistling squeak typically emitted during expiration.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4 text-center">
                {[
                  { id: 'YA', label: lang === 'id' ? 'Ya, Terdengar Mengi' : 'Yes, Audible', desc: '🔊 (Ngiiing)', badgeColor: 'bg-amber-100 text-amber-800' },
                  { id: 'TIDAK', label: lang === 'id' ? 'Tidak Terdengar' : 'No Wheezing', desc: '🤫 (Bersih)', badgeColor: 'bg-emerald-100 text-emerald-800' }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => setWizardData(d => ({ ...d, bsSuaraMengi: opt.id as any }))}
                    className={`p-5 rounded-3xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center space-y-1 select-none h-28 ${
                      wizardData.bsSuaraMengi === opt.id 
                        ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-11 sm:text-[13px] font-black">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}


      {/* ----------------------------------------------------------------- */}
      {/* 3. SECTOR: DEMAM */}
      {/* ----------------------------------------------------------------- */}
      {selectedModule === 'DEMAM' && (
        <div className="space-y-6 flex flex-col text-left">
          
          {/* STEP 1: DANGER SIGNS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 block select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Evaluasi Tanda Bahaya pada Demam' : 'Fever Danger Signs Screening'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-md mx-auto">
                  {lang === 'id' ? 'Tinjau tanda bahaya kejang dan gangguan kesadaran parah pada anak:' : 'Select any danger parameter context. Any active items instantly redirect to emergency ER response screens.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { id: 'kejangAktif', title: '1. Mengalami Kejang Aktif', desc: lang === 'id' ? 'Badan kaku, kelonjotan di luar kendali, mata mendelik ke atas, tidak ada respon saat diajak bicara pas demam.' : 'Active seizures. Shaking fits, rolling eyes, or unresponsiveness during current febrile attack.' },
                  { id: 'kakuKuduk', title: '2. Leher Kaku (Kaku Kuduk)', desc: lang === 'id' ? 'Leher anak kaku membatu. Anak kesakitan saat kepalanya dicoba didorong ditekuk ke arah dadanya.' : 'Stiff neck. Pain or severe physical resistance on flexing chin to breast bone.' },
                  { id: 'kesadaranMenurun', title: '3. Penurunan Kesadaran', desc: lang === 'id' ? 'Anak sangat lemas parah/mengantuk tidak biasa. Dipanggil tidak menyaut, hanya terpejam lelap.' : 'Decreased consciousness. Floppy, sleeping constantly, unable to make eye contact.' },
                  { id: 'bintikMerah', title: '4. Bintik Merah Tidak Pudar', desc: lang === 'id' ? 'Timbul bintik-bintik merah pendarahan pekat di bawah kulit. Saat ditekan permukaan gelas bening warnanya tidak pudar.' : 'Petechiae. Dark purple bleeding spots under hide. Color does not fade under direct glass pressure.' }
                ].map((item) => {
                  const isSelected = wizardData.demamTandaBahaya[item.id as keyof typeof wizardData.demamTandaBahaya] === 'ADA';
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setWizardData(prev => ({
                          ...prev,
                          demamTandaBahaya: {
                            ...prev.demamTandaBahaya,
                            [item.id]: isSelected ? 'TIDAK' : 'ADA'
                          }
                        }));
                      }}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition duration-150 select-none flex flex-col justify-between space-y-3 ${
                        isSelected 
                          ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`font-display font-black text-xs sm:text-sm block ${isSelected ? 'text-red-750' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <p className={`text-[10px] sm:text-xs leading-relaxed font-semibold block ${isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono ${
                          isSelected ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isSelected ? (lang === 'id' ? 'ADA 🔴' : 'YES 🔴') : (lang === 'id' ? 'TIDAK ADA' : 'NONE')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Big Green Safety Confirmation Button */}
              <button 
                type="button"
                onClick={triggerNoDangerSigns}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-black text-xs sm:text-sm rounded-2xl shadow-md transition duration-150 text-center flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Check className="w-5 h-5 text-white stroke-[3px]" />
                <span>{lang === 'id' ? 'TIDAK ADA SAMA SEKALI' : 'NONE OF THESE ARE PRESENT'}</span>
              </button>
            </div>
          )}

          {/* STEP 2: AGE & WEIGHT */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Berapa Usia & Berat Badan Ananda?' : 'Age & Weight of Your Child'}
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                  {lang === 'id' ? 'Berat badan secara presisi diperlukan untuk menghitung asupan dosis obat hangat Parasetamol.' : 'Essential baseline records which serve for paracetamol syrup dispensers.'}
                </p>
              </div>

              {/* Age select cards */}
              <div className="space-y-3 flex flex-col">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'A. Kelompok Kelahiran / Usia Anak:' : 'A. Baseline Age limits:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'KURANG_3_BULAN', label: lang === 'id' ? 'Di bawah 3 Bulan' : 'Under 3 Months', desc: '👶' },
                    { id: '3_BULAN_5_TAHUN', label: lang === 'id' ? '3 Bulan s.d. 5 Tahun' : '3 Months to 5 Years', desc: '🧸' },
                    { id: 'LEBIH_5_TAHUN', label: lang === 'id' ? 'Di atas 5 Tahun' : 'Above 5 Years', desc: '🎒' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, demamUsiaGroup: opt.id as any }))}
                      className={`p-5 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex flex-col justify-center items-center space-y-1.5 select-none h-24 ${
                        wizardData.demamUsiaGroup === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91]' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{opt.desc}</span>
                      <span className="text-xs font-black">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight input */}
              <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-3 shadow-3xs">
                <label className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5 select-none">
                  <Scale className="w-4.5 h-4.5 text-[#5FB7B9]" />
                  <span>{lang === 'id' ? 'B. Berat Badan Anak Presisi:' : 'B. Core weight in Kilograms:'}</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-48 relative select-none">
                    <input 
                      id="demam-weight-input"
                      type="text" 
                      inputMode="decimal"
                      placeholder="Contoh: 12.5"
                      value={wizardData.demamBeratBadan}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                          setWizardData(d => ({ ...d, demamBeratBadan: val }));
                        }
                      }}
                      className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-4 pr-12 text-slate-800 outline-none transition font-extrabold text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 shortcut-kg uppercase select-none">kg</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (wizardData.demamUsiaGroup === 'LEBIH_5_TAHUN') {
                        setEstCategory('CHILD');
                        setEstValue(7);
                      } else if (wizardData.demamUsiaGroup === '3_BULAN_5_TAHUN') {
                        setEstCategory('TODDLER');
                        setEstValue(3);
                      } else {
                        setEstCategory('INFANT');
                        setEstValue(2);
                      }
                      setShowEstimator(!showEstimator);
                    }}
                    className="text-xs font-black text-[#5FB7B9] hover:text-[#3E8E91] underline cursor-pointer select-none py-1 block leading-none self-center"
                  >
                    💡 {lang === 'id' ? 'Lupa Berat Badan? Hitung Estimasi APLS' : 'Forgot weight? Use APLS calculator'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: SUHU & LAMA DEMAM */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Suhu & Durasi Panas Gejala' : 'Temperature readings & Duration'}
                </h3>
              </div>

              {/* A. Temperature base */}
              <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-3.5 shadow-3xs">
                <label className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-wide block select-none">
                  {lang === 'id' ? 'A. Berapa Derajat Suhu Tubuh Terakhir Anak?' : 'A. Stated thermometer degree (Celsius):'}
                </label>
                
                <div className="w-36 relative select-none">
                  <input 
                    id="demam-suhu-input"
                    type="text" 
                    autoFocus
                    inputMode="decimal"
                    placeholder="38.5"
                    value={wizardData.demamSuhu}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setWizardData(d => ({ ...d, demamSuhu: val }));
                      }
                    }}
                    className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5FB7B9] rounded-xl pl-4 pr-12 text-slate-800 outline-none transition font-extrabold text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs select-none">°C</span>
                </div>
              </div>

              {/* B. Duration category */}
              <div className="space-y-3 flex flex-col pt-3">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'B. Sudah Berapa Lama Anak Mengalami Panas/Demam?' : 'B. Stated Fever Duration:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'BARU', label: lang === 'id' ? 'Baru Mulai (< 24 Jam)' : 'Just Started (< 24h)' },
                    { id: '1_2_HARI', label: lang === 'id' ? 'Sudah 1 - 2 Hari' : '1 to 2 Days' },
                    { id: '3_HARI_LEBIH', label: lang === 'id' ? 'Sudah 3 Hari atau Lebih' : '3 Days or More 🟡' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, demamLama: opt.id as any }))}
                      className={`p-4 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex items-center justify-center h-20 select-none ${
                        wizardData.demamLama === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-11 sm:text-[13px] font-black leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: SEIZURE RECORD & PRIOR MEDICATION */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in flex flex-col">
              <div className="text-center space-y-1 select-none">
                <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
                  {lang === 'id' ? 'Riwayat Kejang & Pemberian Penurun Panas' : 'History Seizures & Prior Medicine'}
                </h3>
              </div>

              {/* A. Seizure records */}
              <div className="space-y-3 flex flex-col">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'A. Apakah Anak Memiliki Riwayat Kejang Demam Sebelumnya?' : 'A. Child history of febrile seizures:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'TIDAK_PERNAH', label: lang === 'id' ? 'Tidak Pernah' : 'Never Had One' },
                    { id: 'PERNAH', label: lang === 'id' ? 'Pernah Mengalami' : 'Yes, Has History 🟡' },
                    { id: 'TIDAK_YAKIN', label: lang === 'id' ? 'Ragu / Tidak Tahu' : 'Unsure' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, demamRiwayatKejang: opt.id as any }))}
                      className={`p-4 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex items-center justify-center h-20 select-none ${
                        wizardData.demamRiwayatKejang === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-11 sm:text-[13px] font-black leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* B. Prior Medicine timeframe */}
              <div className="space-y-3 flex flex-col pt-3 border-t border-slate-100 mt-2">
                <span className="font-display font-black text-xs text-[#3E8E91] uppercase tracking-wide select-none">
                  {lang === 'id' ? 'B. Kapan Terakhir Anak Diberi Obat Penurun Panas/Antipiretik?' : 'B. Last dosage of antipyretics (hours ago):'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { id: 'BELUM_ATAU_LEBIH_4_JAM', label: lang === 'id' ? 'Belum Minum / Sudah Lebih dari 4 Jam' : 'None / Stated > 4 hours ago' },
                    { id: 'KURANG_4_JAM', label: lang === 'id' ? 'Baru Minum, Kurang dari 4 Jam lalu' : 'Stated < 4 hours ago' }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setWizardData(d => ({ ...d, demamTerakhirObat: opt.id as any }))}
                      className={`p-4 rounded-2xl border text-center cursor-pointer font-bold transition duration-150 flex items-center justify-center h-24 select-none ${
                        wizardData.demamTerakhirObat === opt.id 
                          ? 'border-[#5FB7B9] bg-[#ECF6F6] text-[#3E8E91] shadow-3xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-11 sm:text-[13px] font-black leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex gap-4 pt-6 border-t border-slate-100 select-none">
        <button 
          type="button"
          onClick={handleBackStep}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 font-display font-black text-xs sm:text-sm transition duration-150 cursor-pointer text-center shadow-3xs"
        >
          {lang === 'id' ? 'Kembali' : 'Back'}
        </button>
        <button 
          type="button"
          onClick={handleNextStep}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-display font-black text-xs sm:text-sm transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-center select-none shadow-xs ${
            canGoNextStep() 
              ? 'bg-[#5FB7B9] hover:bg-[#3E8E91] text-white' 
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
        >
          <span>
            {currentStep === maxSteps 
              ? (lang === 'id' ? 'Selesai & Lihat Hasil' : 'Complete & Results') 
              : (lang === 'id' ? 'Lanjut' : 'Next')
            }
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

    </div>
  );
}
