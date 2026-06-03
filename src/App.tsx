/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ScreenType, WizardData, ModuleType } from './types';
import LandingView from './components/LandingView';
import WizardSteps from './components/WizardSteps';
import HasilView from './components/HasilView';
import { Heart, AlertOctagon } from 'lucide-react';
import { translations, LangType } from './translations';

const initialWizardData: WizardData = {
  selectedModule: null,

  // Module 1: Muntah / Diare
  mdTandaBahaya: {
    letargis: null,
    mataCekung: null,
    muntahSemua: null,
    tidakPipis: null,
  },
  mdBeratBadan: '',
  mdUsiaTahun: '',
  mdUsiaBulan: '',
  mdDurasi: null,
  mdFrekuensi: null,
  mdResponsMinum: null,
  mdKondisiMata: null,
  mdUbunUbun: null,
  mdFrekuensiBabMuntah: '',

  // Module 2: Batuk / Sesak
  bsTandaBahaya: {
    sianosis: null,
    stridor: null,
    tarikanDindingDada: null,
    tidakMauMinum: null,
  },
  bsUsiaGroup: null,
  bsBeratBadan: '',
  bsDurasi: null,
  bsSuaraMengi: null,
  bsLajuNapas: 0,

  // Module 3: Demam
  demamTandaBahaya: {
    kejangAktif: null,
    kakuKuduk: null,
    kesadaranMenurun: null,
    bintikMerah: null,
  },
  demamUsiaGroup: null,
  demamBeratBadan: '',
  demamSuhu: '',
  demamLama: null,
  demamRiwayatKejang: null,
  demamTerakhirObat: null,
};

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('LANDING');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [lang, setLang] = useState<LangType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pedia_care_lang') as LangType) || 'id';
    }
    return 'id';
  });
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('disclaimer_accepted') !== 'true';
    }
    return true;
  });

  const acceptDisclaimer = () => {
    sessionStorage.setItem('disclaimer_accepted', 'true');
    setShowDisclaimer(false);
  };

  const navigate = (newScreen: ScreenType, step: number = 1, pushHistory = true) => {
    setScreen(newScreen);
    if (newScreen === 'WIZARD') {
      setCurrentStep(step);
    }
    if (pushHistory) {
      window.history.pushState(
        { screen: newScreen, step: newScreen === 'WIZARD' ? step : 1 },
        '',
        `#${newScreen.toLowerCase()}${newScreen === 'WIZARD' ? `-step-${step}` : ''}`
      );
    }
  };

  const changeStep = (action: number | ((prev: number) => number)) => {
    setCurrentStep(prev => {
      const nextStep = typeof action === 'function' ? action(prev) : action;
      window.history.pushState(
        { screen: 'WIZARD', step: nextStep },
        '',
        `#wizard-step-${nextStep}`
      );
      return nextStep;
    });
  };

  useEffect(() => {
    window.history.replaceState({ screen: 'LANDING', step: 1 }, '', '#landing');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { screen: prevScreen, step: prevStep } = event.state;
        setScreen(prevScreen);
        if (prevScreen === 'WIZARD') {
          setCurrentStep(prevStep || 1);
        }
      } else {
        setScreen('LANDING');
        setCurrentStep(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (lang === 'id') {
      document.title = "PediaCare: Cek Gejala Sakit Anak";
    } else {
      document.title = "PediaCare: Child Symptom Checker";
    }
  }, [lang]);

  const selectModule = (module: ModuleType) => {
    setWizardData({
      ...initialWizardData,
      selectedModule: module,
    });
    navigate('WIZARD', 1);
  };

  const handleReset = () => {
    setWizardData(initialWizardData);
    navigate('LANDING', 1);
  };

  const t = translations[lang];

  if (showDisclaimer) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F1] via-white to-[#F2FBFA] flex flex-col justify-center items-center py-6 px-4 sm:px-8 relative overflow-hidden" id="disclaimer-screen">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#5FB7B9]/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-amber-200/10 blur-[80px]" />

        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(31,154,154,0.06)] p-6 sm:p-10 text-center flex flex-col items-center justify-between space-y-8 animate-fade-in relative z-10" id="disclaimer-card">
          <div className="absolute top-4 right-4 z-20">
            {/* Modern Segmented Language Selector */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/50 shadow-3xs transition-all duration-200" id="disclaimer-language-toggle">
              <button
                type="button"
                onClick={() => {
                  setLang('id');
                  localStorage.setItem('pedia_care_lang', 'id');
                }}
                className={`px-3 py-1 text-[10px] sm:text-xs font-extrabold rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'id'
                    ? 'bg-[#5FB7B9] text-white shadow-[0_2px_6px_rgba(20,110,110,0.15)]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  localStorage.setItem('pedia_care_lang', 'en');
                }}
                className={`px-3 py-1 text-[10px] sm:text-xs font-extrabold rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#5FB7B9] text-white shadow-[0_2px_6px_rgba(20,110,110,0.15)]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 py-1 px-3.5 bg-teal-50 text-[#3E8E91] rounded-full text-xs font-bold font-display uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-[#5FB7B9] text-[#5FB7B9] animate-pulse" />
              <span>{t.disclaimer.badge}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-800 leading-tight text-center max-w-lg" id="disclaimer-title">
              {t.disclaimer.title}
            </h1>
            <p className="text-slate-500 font-semibold text-xs sm:text-sm max-w-lg mx-auto leading-relaxed text-center">
              {t.disclaimer.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full" id="intro-trust-points">
            <div className="bg-[#F2FBFA] border border-teal-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-lg select-none">✨</span>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-800 block">{t.disclaimer.point1Title}</span>
                <span className="text-[10px] text-slate-500 leading-normal block">{t.disclaimer.point1Desc}</span>
              </div>
            </div>
            <div className="bg-[#F2FBFA] border border-teal-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-lg select-none">🧒</span>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-800 block">{t.disclaimer.point2Title}</span>
                <span className="text-[10px] text-slate-500 leading-normal block">{t.disclaimer.point2Desc}</span>
              </div>
            </div>
            <div className="bg-[#FFF9F1] border border-amber-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-lg select-none">🛡️</span>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-800 block">{t.disclaimer.point3Title}</span>
                <span className="text-[10px] text-slate-500 leading-normal block">{t.disclaimer.point3Desc}</span>
              </div>
            </div>
            <div className="bg-[#FFF9F1] border border-amber-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-lg select-none">🚨</span>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-800 block">{t.disclaimer.point4Title}</span>
                <span className="text-[10px] text-slate-500 leading-normal block">{t.disclaimer.point4Desc}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-100 rounded-2xl text-center space-y-1.5 w-full flex flex-col items-center justify-center">
            <p className="font-extrabold text-amber-800 flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px]">
              <AlertOctagon className="w-4 h-4 text-amber-655 shrink-0" />
              <span>{t.disclaimer.headerNotice}</span>
            </p>
            <p className="text-slate-600 font-semibold text-xs leading-relaxed text-center max-w-md">
              {t.disclaimer.noticeDesc}
            </p>
          </div>

          <button
            onClick={acceptDisclaimer}
            className="w-full py-4 bg-[#5FB7B9] hover:bg-[#3E8E91] text-white font-display font-bold rounded-2xl text-xs sm:text-sm transition duration-200 cursor-pointer text-center shadow-md shadow-teal-500/10"
            id="accept-disclaimer-btn"
          >
            {t.disclaimer.btnAccept}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FFF9F1] to-[#F2FBFA] flex flex-col justify-between animate-fade-in" id="app-root-container">
      {/* Top soft branding header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 py-3 px-4 sticky top-0 z-50 shadow-[0_1px_10px_rgba(0,0,0,0.01)] select-none">
        <div className="w-full max-w-[1080px] mx-auto flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5FB7B9]/10 flex items-center justify-center text-[#5FB7B9]">
              <Heart className="w-4 h-4 fill-[#5FB7B9]" />
            </div>
            <div>
              <span className="font-display font-black text-sm sm:text-base text-slate-800 tracking-tight block">
                {t.app.title}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">
                {t.app.tagline}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switch */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/50 shadow-2xs transition-all duration-200" id="header-language-toggle">
              <button
                type="button"
                onClick={() => {
                  setLang('id');
                  localStorage.setItem('pedia_care_lang', 'id');
                }}
                className={`px-3 py-1 text-[10px] sm:text-xs font-extrabold rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'id'
                    ? 'bg-[#5FB7B9] text-white shadow-[0_2px_6px_rgba(20,110,110,0.15)]'
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  localStorage.setItem('pedia_care_lang', 'en');
                }}
                className={`px-3 py-1 text-[10px] sm:text-xs font-extrabold rounded-full transition-all duration-300 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#5FB7B9] text-white shadow-[0_2px_6px_rgba(20,110,110,0.15)]'
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                EN
              </button>
            </div>

            <span className="text-[9px] sm:text-[10px] font-bold py-1 px-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wide uppercase">
              {t.app.freeBadge}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full py-4 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-fade-in" id="main-content-region">
        <div className="w-full max-w-[1020px] bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.015)] flex flex-col overflow-hidden transition-all duration-300">
          {screen === 'LANDING' && (
            <LandingView 
              lang={lang}
              onSelectModule={selectModule} 
            />
          )}

          {screen === 'WIZARD' && (
            <WizardSteps 
              lang={lang}
              onNavigate={(s) => navigate(s, 1)}
              wizardData={wizardData}
              setWizardData={setWizardData}
              onCompleteWizard={() => navigate('HASIL', currentStep)}
              currentStep={currentStep}
              setCurrentStep={changeStep}
            />
          )}

          {screen === 'HASIL' && (
            <HasilView 
              lang={lang}
              wizardData={wizardData}
              onReset={handleReset}
              onBack={() => navigate('WIZARD', currentStep)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-100/80 py-4 px-5 mt-auto select-none" id="app-footer">
        <div className="w-full max-w-[1080px] mx-auto text-center space-y-1.5 transition-all duration-300">
          <p className="text-slate-400 text-[10px] leading-relaxed">
            {t.app.disclaimerShort}
          </p>
          <div className="text-[9px] font-mono text-slate-300">
            {t.app.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
