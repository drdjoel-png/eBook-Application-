/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChevronLeft, 
  RotateCcw, 
  Calculator, 
  Check, 
  ExternalLink,
  Info,
  AlertTriangle,
  Activity,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { WizardData, PARASETAMOL_OPTIONS } from '../types';

interface HasilViewProps {
  lang: 'id' | 'en';
  wizardData: WizardData;
  onReset: () => void;
  onBack: () => void;
}

export default function HasilView({ lang, wizardData, onReset, onBack }: HasilViewProps) {
  const [selectedSediaan, setSelectedSediaan] = useState<'DROPS_100' | 'SIRUP_120' | 'SIRUP_160' | 'SIRUP_250' | 'TIDAK_YAKIN'>('SIRUP_120');

  const selectedModule = wizardData.selectedModule || 'DEMAM';

  // -----------------------------------------------------------------
  // CLASSIFICATION OF CLINICAL RISKS
  // -----------------------------------------------------------------

  // 1. MODULE 1: MUNTAH / DIARE
  const isMdRed = (): boolean => {
    const { letargis, mataCekung, muntahSemua, tidakPipis } = wizardData.mdTandaBahaya;
    return letargis === 'ADA' || mataCekung === 'ADA' || muntahSemua === 'ADA' || tidakPipis === 'ADA';
  };
  const isMdOrange = (): boolean => {
    const years = parseInt(wizardData.mdUsiaTahun) || 0;
    const months = parseInt(wizardData.mdUsiaBulan) || 0;
    const totalMonths = years * 12 + months;
    const isFontanelleCekung = totalMonths < 18 && wizardData.mdUbunUbun === 'CEKUNG';

    return !isMdRed() && (
      wizardData.mdResponsMinum === 'HAUS' || 
      wizardData.mdResponsMinum === 'MALAS_MINUM' ||
      wizardData.mdKondisiMata === 'CEKUNG' || 
      isFontanelleCekung
    );
  };
  const isMdGreen = (): boolean => {
    return !isMdRed() && !isMdOrange();
  };

  // 2. MODULE 2: BATUK / SESAK
  const isBsRed = (): boolean => {
    const { sianosis, stridor, tarikanDindingDada, tidakMauMinum } = wizardData.bsTandaBahaya;
    return sianosis === 'ADA' || stridor === 'ADA' || tarikanDindingDada === 'ADA' || tidakMauMinum === 'ADA';
  };
  const getIsBsTachypnea = (): boolean => {
    const rate = wizardData.bsLajuNapas;
    if (wizardData.bsUsiaGroup === 'KURANG_2_BULAN') return rate >= 60;
    if (wizardData.bsUsiaGroup === '2_11_BULAN') return rate >= 50;
    if (wizardData.bsUsiaGroup === '1_5_TAHUN') return rate >= 40;
    return false;
  };
  const isBsOrange = (): boolean => {
    return !isBsRed() && (getIsBsTachypnea() || wizardData.bsSuaraMengi === 'YA' || wizardData.bsDurasi === 'LEBIH_14_HARI');
  };
  const isBsGreen = (): boolean => {
    return !isBsRed() && !isBsOrange();
  };

  // 3. MODULE 3: DEMAM
  const isDemamRed = (): boolean => {
    const { kejangAktif, kakuKuduk, kesadaranMenurun, bintikMerah } = wizardData.demamTandaBahaya;
    return kejangAktif === 'ADA' || kakuKuduk === 'ADA' || kesadaranMenurun === 'ADA' || bintikMerah === 'ADA';
  };
  const isDemamOrange = (): boolean => {
    const suhuNum = parseFloat(wizardData.demamSuhu) || 0;
    return !isDemamRed() && (
      suhuNum >= 39.0 || 
      wizardData.demamLama === '3_HARI_LEBIH' || 
      wizardData.demamRiwayatKejang === 'PERNAH' ||
      wizardData.demamUsiaGroup === 'KURANG_3_BULAN'
    );
  };
  const isDemamGreen = (): boolean => {
    return !isDemamRed() && !isDemamOrange();
  };

  // 4. OVERALL RESOLVED COLOR PATHWAY
  const isJalurMerah = (selectedModule === 'MUNTAH_DIARE' && isMdRed()) ||
                       (selectedModule === 'BATUK_SESAK' && isBsRed()) ||
                       (selectedModule === 'DEMAM' && isDemamRed());

  const isJalurOranye = (selectedModule === 'MUNTAH_DIARE' && isMdOrange()) ||
                         (selectedModule === 'BATUK_SESAK' && isBsOrange()) ||
                         (selectedModule === 'DEMAM' && isDemamOrange());

  const isJalurHijau = (selectedModule === 'MUNTAH_DIARE' && isMdGreen()) ||
                       (selectedModule === 'BATUK_SESAK' && isBsGreen()) ||
                       (selectedModule === 'DEMAM' && isDemamGreen());

  // -----------------------------------------------------------------
  // COUPLER FORMULATIONS PREPARATIONS
  // -----------------------------------------------------------------

  // Oralit calculation
  const getOralitCalc = () => {
    const bb = parseFloat(wizardData.mdBeratBadan) || 10;
    const vol = Math.round(75 * bb);
    const sachets = Math.ceil(vol / 200);
    const water = sachets * 200;
    return { vol, sachets, water };
  };
  const oralit = getOralitCalc();

  // Parasetamol calculations for Demam
  const getParacetamolCalc = () => {
    const bb = parseFloat(wizardData.demamBeratBadan) || 10;
    const mgMin = Math.round(10 * bb);
    const mgMax = Math.round(15 * bb);

    const activeOption = PARASETAMOL_OPTIONS.find(o => o.id === selectedSediaan);
    if (!activeOption || activeOption.id === 'TIDAK_YAKIN') {
      return { mgMin, mgMax, mlMin: null, mlMax: null, activeOption };
    }
    const conc = activeOption.mgPerMl;
    const mlMin = (mgMin / conc).toFixed(1);
    const mlMax = (mgMax / conc).toFixed(1);
    return { mgMin, mgMax, mlMin, mlMax, activeOption };
  };
  const para = getParacetamolCalc();

  // -----------------------------------------------------------------
  // GAWAT DARURAT INTERRUPTER SCREEN (Fullscreen red safety shield)
  // -----------------------------------------------------------------
  if (isJalurMerah) {
    return (
      <div className="fixed inset-0 bg-red-650 z-[9999] flex flex-col items-center justify-center text-center p-6 sm:p-12 text-white animate-fade-in" id="jalur-merah-fullscreen">
        <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl animate-pulse mb-2 border border-white/20 select-none">
            ⚠️
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight leading-normal max-w-xl text-center">
            {lang === 'id' ? '⚠️ SEGERA BAWA ANANDA KE IGD.' : '⚠️ IMMEDIATELY TAKE YOUR CHILD TO THE EMERGENCY ROOM.'}
          </h1>
          <p className="text-sm sm:text-lg text-red-100 leading-relaxed font-semibold max-w-lg text-center bg-black/10 p-5 rounded-2xl border border-white/5">
            {lang === 'id' 
              ? 'Ditemukan tanda bahaya gawat darurat medis pada pemeriksaan ananda. Mohon jangan tunda dan segera menuju ke IGD rumah sakit terdekat untuk pertolongan medis.' 
              : "Emergency alert active. Your child shows signs of acute physiological crisis. Go to the nearest Hospital ER department immediately without waiting."}
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full p-2 justify-center select-none">
            <button
              onClick={onBack}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'id' ? 'Kembali' : 'Go Back'}</span>
            </button>
            <button
              onClick={onReset}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4 text-rose-700" />
              <span>{lang === 'id' ? 'Ulangi Cek' : 'Restart Checker'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6 animate-fade-in" id="results-screen">
      
      {/* 1. HERO EVALUATION PATH TITLE BLOCK */}
      <div className="p-6 rounded-[28px] text-left select-none shadow-sm bg-white border border-slate-150 flex flex-col gap-3" id="hasil-status-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl shrink-0">
              {isJalurOranye ? '⚠️' : '✅'}
            </div>
            <div>
              {/* REMOVED WORD STATUS: */}
              <h2 className={`font-display font-black text-lg sm:text-2xl uppercase tracking-tight ${
                isJalurOranye ? 'text-amber-800' : 'text-emerald-700'
              }`}>
                {isJalurOranye 
                  ? (lang === 'id' ? 'Perlu Observasi Ketat' : 'Strict Observation Required')
                  : (lang === 'id' ? 'Aman Terkendali' : 'Under Control & Safe')
                }
              </h2>
            </div>
          </div>

          {/* BADGE AS DEMANDED BY USER */}
          <div>
            {isJalurOranye ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-display font-black text-xs uppercase shadow-3xs">
                <span>🟡</span>
                <span>{lang === 'id' ? 'Perlu Pemeriksaan Dokter' : 'Doctor Consultation Needed'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-display font-black text-xs uppercase shadow-3xs">
                <span>🟢</span>
                <span>{lang === 'id' ? 'Aman Terkendali' : 'Safe to Monitor at Home'}</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed border-t border-slate-100 pt-3">
          {isJalurOranye 
            ? (lang === 'id' ? 'Kondisi ananda memerlukan tindakan asuhan waspada. Beberapa parameter menandai tingginya resiko komplikasi. Perhatikan tatalaksana pencegahan penularan di bawah.' : 'Your child requires strict caution. Several parameters trigger a clinical care alert. Review the details below.')
            : (lang === 'id' ? 'Kondisi ananda stabil, terbebas dari ancaman tanda bahaya dehidrasi, sesak ataupun infeksi berat. Rawat mandiri di rumah menggunakan panduan asuhan berikut.' : 'Your child exhibits stable baseline physiological indicators. You can safely support them at home with the following guidelines.')
          }
        </p>
      </div>

      {/* TWO COLUMN GRID CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: RINGKASAN JAWABAN BUNDA */}
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/50 space-y-4 shadow-3xs" id="ringkasan-jawaban">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 bg-transparent select-none">
            <span className="text-lg">📋</span>
            <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              {lang === 'id' ? 'Ringkasan Jawaban Bunda' : 'Mother\'s Responses Summary'}
            </h3>
          </div>

          <div className="divide-y divide-slate-150 text-left text-xs text-slate-700" id="summary-items">
            {/* MODULE 1: MUNTAH DIARE SUMMARY */}
            {selectedModule === 'MUNTAH_DIARE' && (
              <>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Gejala Utama:</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Muntah / Diare</span>
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Usia Anak:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.mdUsiaTahun || '0'} {lang === 'id' ? 'Tahun' : 'Years'} {wizardData.mdUsiaBulan || '0'} {lang === 'id' ? 'Bulan' : 'Months'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Berat Badan:</span>
                  <span className="font-extrabold text-slate-800">{wizardData.mdBeratBadan} kg</span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Durasi Sakit:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.mdDurasi === 'LEBIH_5_HARI' ? (lang === 'id' ? 'Kronis (≥ 5 Hari) 🟡' : 'Chronic (≥ 5 days) 🟡') : (lang === 'id' ? 'Akut (< 5 Hari)' : 'Acute (< 5 days)')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Frekuensi Harian:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.mdFrekuensi === 'SERING' ? (lang === 'id' ? 'Sering (≥ 4 kali) 🟡' : 'Severe (≥ 4 times) 🟡') : (lang === 'id' ? 'Jarang (1-3 kali)' : 'Mild (1-3 times)')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Respons Minum:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.mdResponsMinum === 'HAUS' ? (lang === 'id' ? 'Sangat Lahap (Sangat Haus) 🟡' : 'Greedy Thirst 🟡') :
                     wizardData.mdResponsMinum === 'MALAS_MINUM' ? (lang === 'id' ? 'Malas Minum / Mogok 🟡' : 'Refusing Fluids 🟡') :
                     (lang === 'id' ? 'Normal / Haus Biasa' : 'Normal')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Kelopak Kelopak Mata:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.mdKondisiMata === 'CEKUNG' ? (lang === 'id' ? 'Tampak Sayu / Cekung 🟡' : 'Sunken Kelopak 🟡') : (lang === 'id' ? 'Normal' : 'Normal')}
                  </span>
                </div>
                {((parseInt(wizardData.mdUsiaTahun) || 0) * 12 + (parseInt(wizardData.mdUsiaBulan) || 0) < 18) && (
                  <div className="py-2.5 flex justify-between gap-2">
                    <span className="font-semibold text-slate-500">Ketegangan Ubun-Ubun:</span>
                    <span className="font-extrabold text-slate-800">
                      {wizardData.mdUbunUbun === 'CEKUNG' ? (lang === 'id' ? 'Ubun-Ubun Cekung 🟡' : 'Sunken Fontanelle 🟡') : (lang === 'id' ? 'Normal / Rata' : 'Normal')}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* MODULE 2: BATUK SESAK SUMMARY */}
            {selectedModule === 'BATUK_SESAK' && (
              <>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Gejala Utama:</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Batuk / Sesak</span>
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Kelompok Usia:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.bsUsiaGroup === 'KURANG_2_BULAN' ? (lang === 'id' ? 'Di bawah 2 Bulan' : '< 2 Months') :
                     wizardData.bsUsiaGroup === '2_11_BULAN' ? (lang === 'id' ? 'Lahir 2-11 Bulan' : '2-11 Months') :
                     (lang === 'id' ? 'Usia 1 - 5 Tahun' : '1-5 Years')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Berat Badan:</span>
                  <span className="font-extrabold text-slate-800">{wizardData.bsBeratBadan} kg</span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Lama Sakit:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.bsDurasi === 'LEBIH_14_HARI' ? (lang === 'id' ? 'Kronis (≥ 14 Hari) 🟡' : 'Chronic (≥ 14 days) 🟡') : (lang === 'id' ? 'Akut (< 14 Hari)' : 'Acute (< 14 days)')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Laju Tarikan Napas:</span>
                  <span className={`font-extrabold ${getIsBsTachypnea() ? 'text-amber-700 font-black' : 'text-slate-800'}`}>
                    {wizardData.bsLajuNapas} x/menit {getIsBsTachypnea() && (lang === 'id' ? ' (Mencapai Napas Cepat! 🟡)' : ' (Rapid Tachypnea! 🟡)')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Suara Mengi (Menciut):</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.bsSuaraMengi === 'YA' ? (lang === 'id' ? 'Terdegar Mengi 🟡' : 'Audible Wheezing 🟡') : (lang === 'id' ? 'Tidak Terdengar' : 'None')}
                  </span>
                </div>
              </>
            )}

            {/* MODULE 3: DEMAM SUMMARY */}
            {selectedModule === 'DEMAM' && (
              <>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Gejala Utama:</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Anak Demam</span>
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Kategori Usia:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.demamUsiaGroup === 'KURANG_3_BULAN' ? (lang === 'id' ? 'Gawat Bayi < 3 Bulan 🟡' : 'Acute < 3 Months 🟡') :
                     wizardData.demamUsiaGroup === '3_BULAN_5_TAHUN' ? (lang === 'id' ? 'Usia 3 Bulan s.d. 5 Tahun' : '3 Months to 5 Years') :
                     (lang === 'id' ? 'Di atas 5 Tahun' : 'Above 5 Years')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Berat Badan:</span>
                  <span className="font-extrabold text-slate-800">{wizardData.demamBeratBadan} kg</span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Suhu Tubuh Panas:</span>
                  <span className={`font-extrabold ${parseFloat(wizardData.demamSuhu) >= 39.0 ? 'text-amber-800 font-extrabold' : 'text-slate-800'}`}>
                    {wizardData.demamSuhu} °C {parseFloat(wizardData.demamSuhu) >= 39.0 && ' (Suhu Sangat Tinggi! 🟡)'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Panas Berlangsung:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.demamLama === '3_HARI_LEBIH' ? (lang === 'id' ? 'Demam Berlarut (≥ 3 Hari) 🟡' : 'Prolonged (≥ 3 days) 🟡') :
                     wizardData.demamLama === '1_2_HARI' ? (lang === 'id' ? 'Panas 1-2 Hari' : '1-2 Days') :
                     (lang === 'id' ? 'Baru Mulai (< 24 Jam)' : '< 24 Hours')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Riwayat Kejang Demam:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.demamRiwayatKejang === 'PERNAH' ? (lang === 'id' ? 'Ada Riwayat Kejang 🟡' : 'History of seizure 🟡') :
                     wizardData.demamRiwayatKejang === 'TIDAK_PERNAH' ? (lang === 'id' ? 'Tidak Pernah' : 'Never Had One') :
                     (lang === 'id' ? 'Ragu / Kurang Tahu' : 'Unsure')}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <span className="font-semibold text-slate-500">Terakhir Antipiretik:</span>
                  <span className="font-extrabold text-slate-800">
                    {wizardData.demamTerakhirObat === 'KURANG_4_JAM' 
                      ? (lang === 'id' ? 'Baru Minum (< 4 Jam lalu)' : 'Recently loaded (< 4h ago)') 
                      : (lang === 'id' ? 'Belum / Sudah > 4 Jam' : 'None / Over 4h ago')
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REHIDRASI / DOSIS CALCULATORS + LOCKED PORTALS */}
        <div className="space-y-6">
          
          {/* TRACK 1: ANAK MUNTAH / DIARE */}
          {selectedModule === 'MUNTAH_DIARE' && (
            <div className="space-y-5">
              
              <div className="relative bg-white border border-slate-150 rounded-3xl p-5 shadow-3xs overflow-hidden text-left" id="muntah-calc-box">
                {/* BLUR ONLY IF ORANGE PATH */}
                <div className={`space-y-4 ${isMdOrange() ? 'blur-[5px] select-none pointer-events-none opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 select-none">
                    <Calculator className="w-4.5 h-4.5 text-[#5FB7B9] shrink-0" />
                    <span className="font-display font-black text-xs text-slate-800 uppercase tracking-widest">{lang === 'id' ? 'Kalkulator Kebutuhan Cairan (Rehidrasi)' : 'Rehydration Fluid Calculator'}</span>
                  </div>
                  
                  <div className="space-y-3 font-semibold text-xs text-slate-650">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>{lang === 'id' ? 'Kebutuhan Oralit (3 Jam Pertama):' : 'Oralit Fluid Needs (First 3 Hours):'}</span>
                      <span className="font-display font-black text-emerald-700 text-sm">{oralit.vol} mL</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>{lang === 'id' ? 'Kebutuhan Sachet (Takaran 200ml):' : 'Oralit Sachets Needed:'}</span>
                      <span className="font-display font-black text-emerald-700 text-sm">{oralit.sachets} Sachet</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>{lang === 'id' ? 'Air Hangat Matang Pelarut:' : 'Boiled Reconstitution Water:'}</span>
                      <span className="font-display font-black text-emerald-700 text-sm">{oralit.water} mL</span>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl space-y-2 mt-3 select-none">
                    <span className="font-black text-emerald-800 text-[11px] block">💡 {lang === 'id' ? 'PRINSIP REHIDRASI & ZINC' : 'REHYDRATION PRINCIPLES'}</span>
                    <p className="text-[10px] text-emerald-700 leading-relaxed font-semibold">
                      {lang === 'id' 
                        ? '1. Sediakan Oralit di rumah. Larutkan 1 sachet ke dalam 200 ml air masak hangat. \n2. Berikan sendok demi sendok secara perlahan setiap habis BAB cair (berikan 50-100 ml tiap kejadian).'
                        : '1. Dissolve 1 envelope sachet in exact 200 ml lukewarm boiled water. 2. Feed Oralit teaspoons very slowly after any loose stools.'
                      }
                    </p>
                  </div>
                </div>

                {/* LOCK OVERLAY */}
                {isMdOrange() && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] flex flex-col justify-center items-center text-center p-5 z-20" id="muntah-locked-overlay">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-3xs border border-amber-100 select-none mb-3">
                      🔒
                    </div>
                    <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-1.5">
                      {lang === 'id' ? 'Kalkulator Rehidrasi Terkunci' : 'Rehydration Formulas Gated'}
                    </h4>
                    <p className="text-amber-850 font-bold text-[11px] sm:text-xs leading-relaxed max-w-xs mb-4">
                      {lang === 'id' 
                        ? `Ananda menunjukkan gejala dehidrasi ringan-sedang karena (${(() => {
                            const p = [];
                            if (wizardData.mdResponsMinum === 'HAUS') p.push('Sangat Haus');
                            if (wizardData.mdResponsMinum === 'MALAS_MINUM') p.push('Malas Minum');
                            if (wizardData.mdKondisiMata === 'CEKUNG') p.push('Mata cekung');
                            if (wizardData.mdUbunUbun === 'CEKUNG') p.push('Ubun-ubun cekung');
                            return p.join(' / ');
                          })()}). Penanganan membutuhkan panduan literatur ketat.`
                        : `Your child shows moderate dehydration criteria (${(() => {
                            const p = [];
                            if (wizardData.mdResponsMinum === 'HAUS') p.push('Eager hunger');
                            if (wizardData.mdResponsMinum === 'MALAS_MINUM') p.push('Slight apathy');
                            if (wizardData.mdKondisiMata === 'CEKUNG') p.push('Sunken kelopak');
                            if (wizardData.mdUbunUbun === 'CEKUNG') p.push('Sunken fontanelle');
                            return p.join(' / ');
                          })()}). Calculation tools locked for safety.`
                      }
                    </p>
                    <a 
                      href="https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Saat_Anak_Sakit_di_Ruma?id=w-TIEQAAQBAJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-3.5 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[11px] sm:text-xs font-black shadow-md cursor-pointer select-none transition animate-pulse"
                    >
                      <span>{lang === 'id' ? 'Buka Kalkulator Cairan & Cara Melarutkan Oralit (Rp32.190)' : 'Unlock Fluids Calculator & Guide (Rp32.190)'}</span>
                      <ExternalLink className="w-4 h-4 shrink-0 text-white" />
                    </a>
                  </div>
                )}
              </div>

              {/* JALUR HIJAU EDUCATION LAYOUT WITH WHITE CRADLE, CHECKMARKS AND SPACE-Y-3 */}
              {isMdGreen() && (
                <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm text-left mt-4" id="muntah-green-edukasi">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4 select-none">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3px]" />
                    </div>
                    <span className="font-display font-black text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                      {lang === 'id' ? 'Panduan Perawatan Diare Mandiri' : 'Home Care Rehydration Guidelines'}
                    </span>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Beri minum air mineral matang, air rebusan beras (tajin), sup hangat, atau air kelapa muda sesering mungkin.' : 'Provide clean mineral water, thin rice porridge brew, vegetable soups, or young coconut water regularly.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Lanjutkan pemberian ASI atau Susu Formula sebanyak biasanya. Jangan kurangi atau batasi frekuensi minum dot.' : 'Maintain standard breastfeeding rate or formula dilution values. Do not lessen fluid volumes.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Sajikan porsi makan yang lebih sedikit namun berulang kali (sup bubur halus saring, pisang atau apel kukus).' : 'Feed smaller but highly repetitive solid portions (filtered porridges, steamed banana grids, or mashed apple).'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TRACK 2: ANAK BATUK / SESAK */}
          {selectedModule === 'BATUK_SESAK' && (
            <div className="space-y-5">
              
              <div className="relative bg-white border border-slate-150 rounded-3xl p-5 shadow-3xs overflow-hidden text-left" id="batuk-calc-box">
                {/* BLUR PORTAL ONLY IF ORANGE PATH */}
                <div className={`space-y-4 ${isBsOrange() ? 'blur-[5px] select-none pointer-events-none opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 select-none">
                    <Activity className="w-4.5 h-4.5 text-[#5FB7B9] shrink-0" />
                    <span className="font-display font-black text-xs text-slate-800 uppercase tracking-widest">{lang === 'id' ? 'Analisis Laju Napas & Diagnosis' : 'Breathing Analysis & Advice'}</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs font-semibold text-slate-650">
                    <div className="flex justify-between border-b border-slate-105 pb-2 leading-tight">
                      <span>{lang === 'id' ? 'Frekuensi Bernapas Terhitung:' : 'Observed Breathing Rate:'}</span>
                      <span className="font-mono font-extrabold text-blue-750 text-sm">{wizardData.bsLajuNapas} x/menit</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-105 pb-2">
                      <span>{lang === 'id' ? 'Klasifikasi Kecepatan Napas:' : 'Respiration Category:'}</span>
                      <span className="font-black text-emerald-600 text-xs uppercase">{lang === 'id' ? 'NORMAL (Tidak Cepat)' : 'NORMAL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'id' ? 'Terdengar Suara Mengi:' : 'Audible Wheezing:'}</span>
                      <span className="font-black text-slate-700 text-xs uppercase">{lang === 'id' ? 'TIDAK TERDENGAR' : 'NONE'}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-110 p-3.5 rounded-2xl mt-2 select-none">
                    <span className="font-black text-emerald-800 text-[11px] block">💡 {lang === 'id' ? 'CUCI HIDUNG & THERAPY MANDIRI' : 'NASAL RINSINGS & COMFORT'}</span>
                    <p className="text-[10.5px] text-emerald-700 leading-normal font-semibold">
                      {lang === 'id'
                        ? '1. Bilas hidung tersumbat secara berkala memakai larutan garam/cucian steril NaCl 0.9% hangat. \n2. Hidupan pelembab uap dingin (Humidifier) dalam kamar tidur kembang.'
                        : '1. Flush mucus blockages using lukewarm sterile saline saline (NaCl 0.9%). 2. Switch on humidifiers to keep mucosa hydrated.'
                      }
                    </p>
                  </div>
                </div>

                {/* LOCK OVERLAY IF ORANGE */}
                {isBsOrange() && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] flex flex-col justify-center items-center text-center p-5 z-20" id="batuk-locked-overlay">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-3xs border border-amber-100 select-none mb-3">
                      🔒
                    </div>
                    <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-1.5">
                      {lang === 'id' ? 'Klasifikasi Pernapasan Terkunci' : 'Respiratory Advisories Gated'}
                    </h4>
                    <p className="text-amber-850 font-bold text-[11px] sm:text-xs leading-relaxed max-w-xs mb-4">
                      {lang === 'id' 
                        ? `Kondisi ananda memerlukan observasi ketat karena (${(() => {
                            const p = [];
                            if (getIsBsTachypnea()) p.push('Laju Napas Cepat (Takipnea)');
                            if (wizardData.bsSuaraMengi === 'YA') p.push('Ada suara Mengi');
                            if (wizardData.bsDurasi === 'LEBIH_14_HARI') p.push('Sakit ≥14 Hari (Kronis)');
                            return p.join(' / ');
                          })()}). Penanganan uap membutuhkan literatur medis ketat.`
                        : `Your child triggers respiratory caution protocols (${(() => {
                            const p = [];
                            if (getIsBsTachypnea()) p.push('Tachypnea / Fast breath rate');
                            if (wizardData.bsSuaraMengi === 'YA') p.push('Wheezing noise');
                            if (wizardData.bsDurasi === 'LEBIH_14_HARI') p.push('Chronic scale ≥14 days');
                            return p.join(' / ');
                          })()}). Calculation dashboards locked.`
                      }
                    </p>
                    <a 
                      href="https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Batuk_Pilek_atau_Sesak?id=29rJEQAAQBAJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-3.5 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[11px] sm:text-xs font-black shadow-md cursor-pointer select-none transition animate-pulse"
                    >
                      <span>{lang === 'id' ? 'Napas Cepat! Buka Panduan Lengkap & Tata Laksana Uap (Rp31.080)' : 'Unlock Nebulizer & Breath Guides (Rp31.080)'}</span>
                      <ExternalLink className="w-4 h-4 shrink-0 text-white" />
                    </a>
                  </div>
                )}
              </div>

              {/* JALUR HIJAU EDUCATION WITH WHITE CRADLE, CHECKMARKS AND SPACE-Y-3 */}
              {isBsGreen() && (
                <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm text-left mt-4" id="batuk-green-edukasi">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4 select-none">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3px]" />
                    </div>
                    <span className="font-display font-black text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                      {lang === 'id' ? 'Cara Cuci Hidung Anak Secara Aman' : 'Nasal Flush Safe Implementation'}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Miringkan kepala anak sedikit ke samping kanan atau kiri tergantung lubang hidung yang dicuci di wastafel.' : 'Tilt the child\'s head slowly to the opposite shoulder side depending on the nostril being flushed.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Semprotkan 1-2 ml cairan steril NaCl 0.9% hangat menggunakan spet tumpul tanpa kateter secara perlahan.' : 'Gently inject 1-2 mL of lukewarm sterilized NaCl 0.9% (saline) solution inside using a needleless syringe.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Biarkan sisa air infus keluar secara alami membawa sumbatan lendir hidung, usap halus dengan tisu kering.' : 'Allow excess mucus or discharge to flow out naturally from the opposite nasal opening, then wipe with dry tissue.'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TRACK 3: ANAK DEMAM */}
          {selectedModule === 'DEMAM' && (
            <div className="space-y-5">
              
              <div className="relative bg-white border border-slate-150 rounded-3xl p-5 shadow-3xs overflow-hidden text-left" id="demam-calc-box">
                {/* BLUR ONLY IF ORANGE */}
                <div className={`space-y-4 ${isDemamOrange() ? 'blur-[5px] select-none pointer-events-none opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 select-none">
                    <Calculator className="w-4.5 h-4.5 text-[#5FB7B9] shrink-0" />
                    <span className="font-display font-black text-xs text-slate-800 uppercase tracking-widest">{lang === 'id' ? 'Kalkulator Dosis Parasetamol Presisi' : 'Precision Paracetamol Dose Calculator'}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>{lang === 'id' ? 'Berat Badan Acuan:' : 'Current Weight Basis:'}</span>
                      <span className="font-bold text-slate-800">{wizardData.demamBeratBadan || '10'} kg</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-150 pb-2 text-xs font-semibold text-slate-650">
                      <span>{lang === 'id' ? 'Rekomendasi Dosis (miligram):' : 'Target Dosage (mg):'}</span>
                      <span className="font-extrabold text-emerald-700 text-[13px]">{para.mgMin} – {para.mgMax} mg</span>
                    </div>

                    <div className="space-y-1.5 select-none text-left">
                      <label htmlFor="hasil-sediaan-select" className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{lang === 'id' ? 'Pilih Sediaan Obat yang Tersedia di Rumah:' : 'Select Home Available Medication Syrup:'}</label>
                      <select
                        id="hasil-sediaan-select"
                        value={selectedSediaan}
                        onChange={(e) => setSelectedSediaan(e.target.value as any)}
                        className="w-full h-11 bg-slate-50 border border-slate-150 rounded-xl px-3 text-xs outline-none focus:border-[#5FB7B9] font-bold text-slate-700 cursor-pointer"
                      >
                        {PARASETAMOL_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {lang === 'id' ? opt.label : opt.labelEn || opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {para.mlMin !== null && para.mlMax !== null && (
                      <div className="flex justify-between bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-xs font-semibold text-emerald-800 items-center">
                        <span>{lang === 'id' ? 'Takaran Takaran Sekali Minum:' : 'Dosage Volume per Intake:'}</span>
                        <span className="font-display font-black text-sm italic">{para.mlMin} – {para.mlMax} mL</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOCK OVERLAY IF ORANGE PATH */}
                {isDemamOrange() && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] flex flex-col justify-center items-center text-center p-5 z-20" id="demam-locked-overlay">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-3xs border border-amber-100 select-none mb-3">
                      🔒
                    </div>
                    <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-1.5">
                      {lang === 'id' ? 'Kalkulator Dosis Terkunci' : 'Dosage Calculator Locked'}
                    </h4>
                    <p className="text-amber-850 font-bold text-[11px] sm:text-xs leading-relaxed max-w-xs mb-4">
                      {lang === 'id' 
                        ? `Kondisi ananda butuh observasi medis khusus karena (${(() => {
                            const p = [];
                            if (parseFloat(wizardData.demamSuhu) >= 39.0) p.push('Suhu tinggi ≥39°C');
                            if (wizardData.demamLama === '3_HARI_LEBIH') p.push('Demam lama ≥3 hari');
                            if (wizardData.demamRiwayatKejang === 'PERNAH') p.push('Ada Riwayat Kejang');
                            if (wizardData.demamUsiaGroup === 'KURANG_3_BULAN') p.push('Bayi <3 bulan');
                            return p.join(' / ');
                          })()}). Pemberian obat beresiko tinggi jika tanpa panduan ketat.`
                        : `Your child requires careful checks since (${(() => {
                            const p = [];
                            if (parseFloat(wizardData.demamSuhu) >= 39.0) p.push('High Temp ≥39°C');
                            if (wizardData.demamLama === '3_HARI_LEBIH') p.push('Fever ≥3 days');
                            if (wizardData.demamRiwayatKejang === 'PERNAH') p.push('History of Seizure');
                            if (wizardData.demamUsiaGroup === 'KURANG_3_BULAN') p.push('Infant <3 months');
                            return p.join(' / ');
                          })()}). Dosing is guarded.`
                      }
                    </p>
                    <a 
                      href="https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Saat_Anak_Sakit_di_Ruma?id=w-TIEQAAQBAJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-3.5 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[11px] sm:text-xs font-black shadow-md cursor-pointer select-none transition animate-pulse"
                    >
                      <span>{lang === 'id' ? 'Waspada Komplikasi! Buka Kalkulator Dosis Obat & Panduan Demam (Rp32.190)' : 'Unlock Fever Compendium & Dosages (Rp32.190)'}</span>
                      <ExternalLink className="w-4 h-4 shrink-0 text-white" />
                    </a>
                  </div>
                )}
              </div>

              {/* JALUR HIJAU COMPRESS RULES WITH WHITE CARD CRADLE, CHECKMARKS AND SPACE-Y-3 */}
              {isDemamGreen() && (
                <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm text-left mt-4" id="demam-green-edukasi">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4 select-none">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3px]" />
                    </div>
                    <span className="font-display font-black text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                      {lang === 'id' ? 'Tips Mengompres Anak yang Benar' : 'Proper Compress Methodology'}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Gunakan air hangat suam kuku biasa (jangan pakai air seduhan es atau alkohol) untuk meredam suhu.' : 'Use lukewarm tap water (never chilled ice water or alcohol rubs) to wipe.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Seka lipatan-lipatan tubuh bayi (terutama sela-sela ketiak ataupun lekuk paha panggul) sebagai area pembuangan panas utama.' : 'Compress around rich arterial folds like armpits and groin joints, not just the forehead.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {lang === 'id' ? 'Basahi kembali kompresan seka hangat bila sudah mulai mendingin agar pori-pori kulit anak tetap lebar melepas suhu.' : 'Replenish and re-moisten wraps as soon as they cool down to keep vessels dilated.'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* FOOTER ACTIONS AND REBOOT */}
      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 select-none" id="hasil-footer-reset-bar">
        <div className="text-center sm:text-left">
          <h4 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
            {lang === 'id' ? 'Ingin mengulangi pemeriksaan?' : 'Evaluate another child?'}
          </h4>
          <p className="text-[10px] sm:text-xs text-slate-450 font-semibold leading-relaxed mt-1">
            {lang === 'id' ? 'Anda dapat kembali ke halaman muka untuk menyaring gejala sakit anak yang lain.' : 'You can reset answers and return to the main dashboard.'}
          </p>
        </div>
        
        <button 
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-display font-black text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>{lang === 'id' ? 'Ulangi & Reset Pemeriksaan' : 'Reset & Start Over'}</span>
        </button>
      </div>

    </div>
  );
}
