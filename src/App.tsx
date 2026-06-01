/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ScreenType, WizardData } from './types';
import LandingView from './components/LandingView';
import BelajarView from './components/BelajarView';
import WizardSteps from './components/WizardSteps';
import HasilView from './components/HasilView';
import { Heart } from 'lucide-react';

const initialWizardData: WizardData = {
  tandaBahaya: {
    respons: null,
    napas: null,
    minumBak: null,
    tandaLain: null,
  },
  usiaTahun: '',
  usiaBulan: '',
  suhu: '',
  caraUkur: null,
  lamaDemam: null,
  riwayatKejang: null,
};

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('LANDING');
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);

  const startPanicCheck = () => {
    // Direct track: Reset to clean, but go directly to sign-checking wizard
    setWizardData({
      ...initialWizardData,
      tandaBahaya: {
        respons: null,
        napas: null,
        minumBak: null,
        tandaLain: null,
      }
    });
    setScreen('WIZARD');
  };

  const startFeverCheck = () => {
    // Normal track after learning: Clean slate
    setWizardData(initialWizardData);
    setScreen('WIZARD');
  };

  const handleReset = () => {
    setWizardData(initialWizardData);
    setScreen('LANDING');
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col justify-between" id="app-root-container">
      {/* Top soft branding header for desktop centering and clean identity */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-4 sticky top-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.015)] select-none">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
              <Heart className="w-4 h-4 fill-brand-teal" />
            </div>
            <div>
              <span className="font-display font-black text-xs text-slate-800 tracking-tight block">
                PediaCare+
              </span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">
                Panduan Interaktif Demam
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold py-1 px-2.5 rounded-full bg-brand-teal-light text-brand-teal-dark tracking-wide uppercase">
            Edukasi Bunda
          </span>
        </div>
      </header>

      {/* Main Container tailored specifically as a compact mobile-first shell card */}
      <main className="flex-grow w-full bg-slate-50 flex items-center justify-center py-4 px-3" id="main-content-region">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
          {screen === 'LANDING' && (
            <LandingView 
              onNavigate={setScreen} 
              onStartPanicCheck={startPanicCheck} 
            />
          )}

          {screen === 'BELAJAR' && (
            <BelajarView 
              onNavigate={setScreen} 
              onStartFeverCheck={startFeverCheck} 
            />
          )}

          {screen === 'WIZARD' && (
            <WizardSteps 
              onNavigate={setScreen}
              wizardData={wizardData}
              setWizardData={setWizardData}
              onCompleteWizard={() => setScreen('HASIL')}
            />
          )}

          {screen === 'HASIL' && (
            <HasilView 
              wizardData={wizardData}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Persistent safety, privacy & medical validation footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-5 mt-auto select-none" id="app-footer">
        <div className="max-w-md mx-auto text-center space-y-2">
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Panduan interaktif ini membantu mengenali tingkat risiko awal gejala demam ananda, bukan diagnosis medis dan <strong>bukan pengganti pemeriksaan dokter secara langsung</strong>. Bebas login & tanpa menyimpan data pribadi Bunda.
          </p>
          <div className="text-[9px] font-mono text-slate-300">
            © 2026 PediaCare+
          </div>
        </div>
      </footer>
    </div>
  );
}
