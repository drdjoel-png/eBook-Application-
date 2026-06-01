/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChevronLeft, 
  RotateCcw, 
  Share2, 
  BookOpen, 
  AlertOctagon, 
  Calculator, 
  Heart, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';
import { WizardData, RiskLevel, PARASETAMOL_OPTIONS, ParasetamolSediaan } from '../types';

interface HasilViewProps {
  wizardData: WizardData;
  onReset: () => void;
}

export default function HasilView({ wizardData, onReset }: HasilViewProps) {
  // 1. Calculate Risk Level based on rules
  const getRiskLevel = (): RiskLevel => {
    const { respons, napas, minumBak, tandaLain } = wizardData.tandaBahaya;
    
    // 🔴 SEGera KE IGD: If any danger sign is "ADA"
    if (respons === 'ADA' || napas === 'ADA' || minumBak === 'ADA' || tandaLain === 'ADA') {
      return 'MERAH';
    }

    const suhuNum = parseFloat(wizardData.suhu) || 0;
    const isDemamLama = wizardData.lamaDemam === '3_HARI_LEBIH' || wizardData.lamaDemam === 'LEBIH_5_HARI_NAIK_TURUN';
    
    // 🟠 PERIKSA DOKTER HARI INI: Suhu >= 39.5 or Demam >= 3 days or climb-fall
    if (suhuNum >= 39.5 || isDemamLama) {
      return 'ORANYE';
    }

    // 🟡 WASPADA: Suhu 38.5 - 39.4 (and < 3 days) or has seizure risk (or unsure)
    const isHigherSuhu = suhuNum >= 38.5; // (since we didn't trigger ORANYE >= 39.5, this covers 38.5 - 39.4)
    const isKejangRisk = wizardData.riwayatKejang === 'PERNAH' || wizardData.riwayatKejang === 'TIDAK_YAKIN';
    
    if (isHigherSuhu || isKejangRisk) {
      return 'KUNING';
    }

    // 🟢 PANTAU DI RUMAH: All normal / subfebris, < 3 days, no danger, no seizure history
    return 'HIJAU';
  };

  const risk = getRiskLevel();

  // Age label warning check (usia > 5 tahun)
  const isOverAgeRange = (): boolean => {
    const yrs = typeof wizardData.usiaTahun === 'number' ? wizardData.usiaTahun : 0;
    const mths = typeof wizardData.usiaBulan === 'number' ? wizardData.usiaBulan : 0;
    const totalMonths = (yrs * 12) + mths;
    return totalMonths > 60; // 5 years old is 60 months
  };

  // Convert measurement site to friendly text
  const getCaraUkurLabel = (): string => {
    switch (wizardData.caraUkur) {
      case 'KETIAK': return 'Ketiak';
      case 'DAHI': return 'Dahi';
      case 'TELINGA': return 'Telinga';
      case 'REKTAL': return 'Rektal (Anus)';
      default: return 'Tidak yakin / lupa';
    }
  };

  // Convert fever duration to friendly Indonesian text
  const getFeverDurationLabel = (): string => {
    switch (wizardData.lamaDemam) {
      case 'KURANG_24_JAM': return 'Baru mulai hari ini (< 24 jam)';
      case '1_2_HARI': return '1 - 2 hari';
      case '3_HARI_LEBIH': return '3 hari atau lebih';
      case 'LEBIH_5_HARI_NAIK_TURUN': return 'Lebih dari 5 hari / naik-turun lama';
      default: return '-';
    }
  };

  // State for Parasetamol calculation
  const [bbInput, setBbInput] = useState<string>('');
  const [selectedSediaan, setSelectedSediaan] = useState<string>('DROPS_100');
  const [calculatedDose, setCalculatedDose] = useState<{ mg: number; ml: number | null } | null>(null);
  const [bbError, setBbError] = useState<string | null>(null);

  const calculateDose = (bbValue: string, sediaanId: string) => {
    setBbError(null);
    if (!bbValue.trim()) {
      setBbError('Berat badan diperlukan untuk menghitung dosis parasetamol dengan aman.');
      setCalculatedDose(null);
      return;
    }

    const bbNum = parseFloat(bbValue.replace(',', '.'));
    if (isNaN(bbNum) || bbNum <= 0) {
      setBbError('Angka berat badan harus berupa angka positif yang valid.');
      setCalculatedDose(null);
      return;
    }

    const sediaan = PARASETAMOL_OPTIONS.find(o => o.id === sediaanId);
    if (!sediaan) return;

    // Dosis mg = berat badan * 10 mg
    const dosageMg = bbNum * 10;
    let dosageMl: number | null = null;

    if (sediaan.mgPerMl > 0) {
      dosageMl = dosageMg / sediaan.mgPerMl;
    }

    setCalculatedDose({
      mg: parseFloat(dosageMg.toFixed(2)),
      ml: dosageMl !== null ? parseFloat(dosageMl.toFixed(2)) : null
    });
  };

  const handleBbChange = (e: string) => {
    setBbInput(e);
    calculateDose(e, selectedSediaan);
  };

  const handleSediaanChange = (e: string) => {
    setSelectedSediaan(e);
    calculateDose(bbInput, e);
  };

  // 2. Generate WhatsApp share message content
  const generateWhatsAppShare = () => {
    const riskTitle = {
      HIJAU: '🟢 PANTAU DI RUMAH',
      KUNING: '🟡 WASPADA',
      ORANYE: '🟠 PERIKSA DOKTER HARI INI',
      MERAH: '🔴 SEGERA KE IGD'
    }[risk];

    let alasanText = '';
    let tindakanText = '';
    
    if (risk === 'HIJAU') {
      alasanText = 'Suhu ananda belum termasuk demam tinggi, demam belum berlangsung lama, dan tidak ada tanda bahaya yang Bunda pilih di awal.';
      tindakanText = [
        '• Pantau suhu dan kondisi ananda secara berkala',
        '• Pastikan ananda mendapatkan asupan cairan yang cukup',
        '• Biarkan ananda beristirahat di ruangan nyaman',
        '• Ulangi penilaian bila suhu naik atau kondisi anak berubah',
        '• Tidak perlu memaksa suhu sampai normal bila ananda masih aktif/tampak nyaman'
      ].join('\n');
    } else if (risk === 'KUNING') {
      alasanText = `Suhu ananda sudah masuk demam (${wizardData.suhu}°C), tetapi belum ada tanda bahaya berat dan demam baru berlangsung singkat (< 3 hari).`;
      if (wizardData.riwayatKejang === 'PERNAH') {
        alasanText += ' *Ananda memiliki riwayat kejang saat demam sebelumnya, sehingga butuh pemantauan ekstra.*';
      } else if (wizardData.riwayatKejang === 'TIDAK_YAKIN') {
        alasanText += ' *Kondisi riwayat kejang demam ananda belum pasti, disarankan dipantau dengan lebih hati-hati.*';
      }
      tindakanText = [
        '• Pantau suhu dan kondisi ananda berkala setiap beberapa jam',
        '• Pastikan ananda tetap mau minum cairan',
        '• Jangan hanya berfokus pada angka termometer, melainkan respons anak',
        '• Parasetamol dapat dipertimbangkan bila suhu >= 38.5°C dan ananda merasa kurang nyaman',
        '• Ulangi penilaian secara berkala. Jika demam naik terus, atau ananda tampak lemas, segera periksa ke dokter.'
      ].join('\n');
    } else if (risk === 'ORANYE') {
      alasanText = `Suhu ananda cukup tinggi (${wizardData.suhu}°C), demam sudah berlangsung selama ${getFeverDurationLabel()}, atau demam bertahan naik-turun cukup lama.`;
      if (parseFloat(wizardData.suhu) >= 40) {
        alasanText += ' \n🚨 *Suhu ananda sangat tinggi (>= 40°C). Segera jadwalkan pemeriksaan dokter.*';
      }
      tindakanText = [
        '• Rencanakan pemeriksaan dokter atau ke pusat kesehatan hari ini juga',
        '• Tetap pantau respons ananda, pola napas, warna bibir, dan asupan minum/BAK',
        '• Berikan cairan sedikit demi sedikit tetapi sering agar terhindar dari dehidrasi',
        '• Parasetamol dapat dipertimbangkan jika suhu >= 38.5°C agar ananda lebih nyaman',
        '• Jangan menunda ke dokter hanya karena suhu sempat turun setelah minum obat'
      ].join('\n');
    } else if (risk === 'MERAH') {
      alasanText = 'Bunda memilih adanya tanda bahaya klinis yang memerlukan tindakan cepat dan pengawasan dokter segera.';
      tindakanText = [
        '⚠️ Jangan menunggu demamnya turun terlebih dahulu!',
        '• Bawa ananda sesegera mungkin ke IGD rumah sakit terdekat',
        '• Jika terjadi kejang, sesak napas berat, atau bibir kebiruan, cari pertolongan darurat segera',
        '• Jangan memaksa memberi makan/minum jika kesadaran ananda tampak menurun',
        '• Siapkan catatan: suhu terakhir, lama demam, obat yang sudah diminum'
      ].join('\n');
    }

    let parasetamolSection = '';
    const suhuNum = parseFloat(wizardData.suhu) || 0;
    if (risk !== 'MERAH' && suhuNum >= 38.5 && calculatedDose) {
      const activeSediaan = PARASETAMOL_OPTIONS.find(o => o.id === selectedSediaan);
      const sediaanLabel = activeSediaan ? activeSediaan.label : '';
      
      parasetamolSection = `💊 *Estimasi Parasetamol (Saran Awal):*
• Berat Badan: ${bbInput} kg
• Sediaan: ${sediaanLabel}
• Dosis: ${calculatedDose.mg} mg per kali minum
${calculatedDose.ml !== null ? `• Setara: ${calculatedDose.ml} mL tiap kali minum` : '• Hubungi apoteker/dokter untuk takaran mL obat Anda'}
• Aturan: Dapat diberikan tiap 4-6 jam jika perlu (max 4x dalam 24 jam). Gunakan spuit obat agar takaran presisi.
`;
    }

    const ageWarning = isOverAgeRange() 
      ? '⚠️ *Catatan*: Hasil ini bersifat panduan umum karena usia ananda di luar target utama (1-5 tahun).' 
      : '';

    const textPayload = `🩺 *RINGKASAN PANDUAN DEMAM ANANDA* 🩺

*LEVEL RISIKO:*
${riskTitle}
${ageWarning ? `\n${ageWarning}\n` : ''}
----------------------------------------

👤 *Data Ananda:*
• Usia: ${wizardData.usiaTahun} tahun ${wizardData.usiaBulan ? `${wizardData.usiaBulan} bulan` : ''}
• Suhu: ${wizardData.suhu}°C (diukur di ${getCaraUkurLabel()})
• Riwayat Kejang: ${wizardData.riwayatKejang === 'PERNAH' ? 'Pernah' : wizardData.riwayatKejang === 'TIDAK_PERNAH' ? 'Tidak pernah' : 'Tidak yakin/lupa'}

----------------------------------------

📋 *Alasan Hasil Ini:*
${alasanText}

----------------------------------------

💡 *Langkah Penting Sekarang:*
${tindakanText}

${parasetamolSection ? `----------------------------------------\n${parasetamolSection}\n` : ''}----------------------------------------

🚨 *Segera ke IGD jika:*
Kejang, napas berat/tersengal, sangat lemas/sulit dibangunkan, tidak mau minum sama sekali, air kencing berkurang drastis, bibir kebiruan, atau muncul ruam kemerahan/keunguan.

----------------------------------------
_Edukasi ini bersifat awal & bukan pengganti pemeriksaan dokter langsung._

📘 *Rekomendasi Buku dr. Zulia Ahmad Burhani, SpA:*
1. "Saat Anak Sakit di Rumah" (Demam, Kejang, Diare):
   👉 https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Saat_Anak_Sakit_di_Ruma?id=w-TIEQAAQBAJ

2. "Batuk, Pilek atau Sesak pada Anak":
   👉 https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Batuk_Pilek_atau_Sesak?id=29rJEQAAQBAJ`;

    return `https://wa.me/?text=${encodeURIComponent(textPayload)}`;
  };

  // E-book component rendering helper
  const renderEBooks = (isFooterPosition: boolean) => {
    const headerCopy = {
      HIJAU: 'Walaupun saat ini belum tampak tanda bahaya, Bunda bisa membaca panduan lengkap agar lebih siap saat ananda sakit di rumah.',
      KUNING: 'Ananda perlu dipantau lebih ketat. Bunda bisa membaca panduan lengkap agar tahu tanda apa yang perlu diperhatikan berikutnya.',
      ORANYE: 'Ananda sebaiknya diperiksa dokter hari ini. E-book ini bisa membantu Bunda memahami tanda bahaya dan mencatat kondisi ananda sebelum diperiksa.',
      MERAH: 'Saat ini prioritas utama adalah membawa ananda ke IGD atau fasilitas kesehatan. Setelah ananda mendapatkan pemeriksaan, Bunda bisa membaca panduan lengkap agar keluarga lebih siap menghadapi kondisi anak sakit berikutnya.'
    }[risk];

    return (
      <div className={`mt-8 space-y-4 ${isFooterPosition ? 'border-t border-slate-100 pt-6 opacity-90' : ''}`} id="recommended-books-section">
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Rekomendasi Buku</span>
          <h3 className="font-display font-bold text-sm text-slate-800">
            E-Book dr. Zulia Ahmad Burhani, SpA
          </h3>
          <p className="text-slate-500 text-[10.5px] mt-1 leading-relaxed">
            {headerCopy}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Cover Book 1: Saat Anak Sakit di Rumah */}
          <a
            href="https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Saat_Anak_Sakit_di_Ruma?id=w-TIEQAAQBAJ"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-[#FAF8F5] border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.07)] hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden text-left"
            aria-label="Buku Saat Anak Sakit di Rumah oleh dr Zulia Ahmad Burhani SpA"
          >
            {/* Book Spine Shadow and Page line effects */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 via-black/5 to-transparent z-10" />
            <div className="absolute left-[11px] top-0 bottom-0 w-[0.5px] bg-white/15 z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/5 z-10" />

            {/* Real Cover Image */}
            <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center shrink-0 border-b border-slate-100">
              <img
                src="/cover_sakit_di_rumah.jpg"
                alt="Buku Saat Anak Sakit di Rumah"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            {/* Info Footer */}
            <div className="p-3 flex-grow flex flex-col justify-between bg-white text-center">
              <div className="space-y-0.5">
                <h4 className="font-display font-extrabold text-[#1e293b] text-[10.5px] leading-tight line-clamp-1 uppercase tracking-tight">
                  Saat Anak Sakit di Rumah
                </h4>
                <p className="text-[8.5px] text-slate-400 font-medium">dr. Zulia Ahmad, SpA</p>
              </div>
              <div className="mt-2.5 py-1 px-2.5 bg-brand-teal/10 rounded-lg group-hover:bg-brand-teal group-hover:text-white text-brand-teal-dark text-[9px] font-extrabold flex items-center justify-center gap-1 transition duration-200 shadow-xs">
                <span>Buka E-Book</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </div>
            </div>
          </a>

          {/* Cover Book 2: Batuk, Pilek atau Sesak pada Anak */}
          <a
            href="https://play.google.com/store/books/details/dr_Zulia_Ahmad_Burhani_SpA_Batuk_Pilek_atau_Sesak?id=29rJEQAAQBAJ"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-[#F4F9FF] border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.07)] hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden text-left"
            aria-label="Buku Batuk Pilek atau Sesak pada Anak oleh dr Zulia Ahmad Burhani SpA"
          >
            {/* Book Spine Shadow and Page line effects */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 via-black/5 to-transparent z-10" />
            <div className="absolute left-[11px] top-0 bottom-0 w-[0.5px] bg-white/15 z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/5 z-10" />

            {/* Real Cover Image */}
            <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center shrink-0 border-b border-slate-100">
              <img
                src="/cover_batuk_pilek.jpg"
                alt="Buku Batuk Pilek atau Sesak pada Anak"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            {/* Info Footer */}
            <div className="p-3 flex-grow flex flex-col justify-between bg-white text-center">
              <div className="space-y-0.5">
                <h4 className="font-display font-extrabold text-[#1e293b] text-[10.5px] leading-tight line-clamp-1 uppercase tracking-tight">
                  Batuk, Pilek, Sesak Anak
                </h4>
                <p className="text-[8.5px] text-slate-400 font-medium">dr. Zulia Ahmad, SpA</p>
              </div>
              <div className="mt-2.5 py-1 px-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 text-[9px] font-extrabold flex items-center justify-center gap-1 transition duration-200 shadow-xs">
                <span>Buka E-Book</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-6 animate-fade-in pb-16" id="results-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-teal transition"
          id="back-to-wizard-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Mulai Ulang</span>
        </button>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Langkah 6/6 · Hasil Penilaian</span>
        <div className="w-16" />
      </div>

      {/* RATING BADGE AGE EXCLUSION ADVISORIES */}
      {isOverAgeRange() && (
        <div className="p-3.5 bg-amber-55/70 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 text-xs font-medium">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <p className="font-bold font-display text-[11px] uppercase tracking-wide">Panduan Umum</p>
            <p className="text-amber-750 text-[10px] leading-relaxed">
              Usia ananda di luar target utama (1–5 tahun). Karena usia ananda di luar target utama, hasil ini sebaiknya dibaca sebagai arahan umum saja.
            </p>
          </div>
        </div>
      )}

      {/* Thermometer measurement type alert */}
      {wizardData.caraUkur === 'TIDAK_YAKIN' && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl flex items-start gap-3 text-xs font-medium">
          <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <p className="font-bold font-display text-[11px] uppercase tracking-wide">Pengukuran Tidak Pasti</p>
            <p className="text-slate-650 text-[10px] leading-relaxed">
              Karena cara ukur suhu tidak dipastikan, angka suhu ({wizardData.suhu}°C) perlu dibaca dengan hati-hati. Tetap perhatikan kondisi ananda secara keseluruhan, bukan hanya angka suhu.
            </p>
          </div>
        </div>
      )}

      {/* 2. CHOOSE CORRESPONDING DIAGNOSTIC CARD BASED ON TRIAJE */}
      {risk === 'HIJAU' && (
        <div className="bg-white rounded-2xl border border-pastel-green-bg shadow-[0_4px_16px_rgba(46,125,50,0.04)] overflow-hidden" id="card-hijau">
          <div className="p-4 bg-pastel-green-bg text-pastel-green-text flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-display font-extrabold text-base shadow-sm shrink-0">
              🟢
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm">Pantau di Rumah</h2>
              <p className="text-emerald-800 text-[9.5px] opacity-90">Kondisi stabil tanpa red-flags</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kesimpulan</h4>
              <p className="text-slate-700 text-xs font-medium leading-relaxed">
                Saat ini belum tampak tanda bahaya dari jawaban Bunda. Ananda dapat dipantau di rumah sambil tetap memperhatikan perkembangan kondisi ke depannya.
              </p>
            </div>

            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kenapa hasil ini muncul?</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Suhu ananda ({wizardData.suhu}°C dengan lokasi {getCaraUkurLabel()}) belum termasuk demam tinggi, demam belum berlangsung lama, dan tidak ada tanda bahaya yang Bunda pilih di awal.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Apa yang perlu dilakukan sekarang?</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Pantau suhu tubuh dan kondisi fisik ananda berkala sehari 3-4 kali.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Pastikan ananda cukup minum air putih, ASI, kuah sup, atau cairan pelengkap.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Biarkan ananda beristirahat dan gunakan pakaian tipis/ruangan sejuk.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Ulangi penilaian ini bila suhu badan naik lagi atau kondisi memburuk.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Tidak perlu mengejar suhu harus kembali ke 36.5°C jika ananda masih tampak aktif, nyaman, dan mau bermain.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <h5 className="font-display font-bold text-xs text-rose-800 flex items-start gap-2 mb-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5 animate-pulse" />
                <span>Segera ke IGD bila:</span>
              </h5>
              <p className="text-rose-700 text-[10px] leading-relaxed pl-5.5">
                Kejang, napas berat / sesak, sangat lemas, sulit dibangunkan, tidak mau minum sama sekali, BAK sangat sedikit, bibir kebiruan, atau timbul ruam merah keunguan di kulit.
              </p>
            </div>
          </div>
        </div>
      )}

      {risk === 'KUNING' && (
        <div className="bg-white rounded-2xl border border-pastel-yellow-bg shadow-[0_4px_16px_rgba(245,127,23,0.04)] overflow-hidden" id="card-kuning">
          <div className="p-4 bg-pastel-yellow-bg text-pastel-yellow-text flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-display font-extrabold text-base shadow-sm shrink-0">
              🟡
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm">Waspada</h2>
              <p className="text-yellow-900 text-[9.5px] opacity-90">Pemantauan Mandiri Lebih Ketat</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kesimpulan</h4>
              <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                Saat ini belum tampak tanda bahaya dari jawaban Bunda, tetapi ananda perlu dipantau lebih ketat karena beberapa faktor penyerta.
              </p>
            </div>

            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kenapa hasil ini muncul?</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Suhu ananda ({wizardData.suhu}°C) sudah tergolong demam/suhu meningkat, tetapi belum ada tanda bahaya klinis berat dan demam berlangsung kurang dari 3 hari.
              </p>
              {wizardData.riwayatKejang === 'PERNAH' && (
                <div className="p-2.5 bg-yellow-50/70 border border-yellow-100 rounded-xl text-[10px] text-yellow-950 font-medium mt-1 leading-relaxed flex items-start gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-yellow-700 shrink-0 mt-0.5" />
                  <span><strong>Advisory Kejang</strong>: Ananda memiliki riwayat kejang saat demam. Saat ini belum ada tanda bahaya dari jawaban Bunda, tetapi pemantauan suhu perlu lebih ketat.</span>
                </div>
              )}
              {wizardData.riwayatKejang === 'TIDAK_YAKIN' && (
                <div className="p-2.5 bg-yellow-50/70 border border-yellow-100 rounded-xl text-[10px] text-yellow-950 font-medium mt-1 leading-relaxed flex items-start gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-yellow-700 shrink-0 mt-0.5" />
                  <span><strong>Advisory Kejang</strong>: Bunda tidak yakin apakah ananda pernah kejang saat demam sebelumnya. Karena itu, pemantauan perlu lebih hati-hati.</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Apa yang perlu dilakukan sekarang?</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Pantau suhu serta perilaku respons anak berkala minimal tiap 4 jam.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Pastikan ananda tetap mendapatkan asupan sediaan cairan/minuman sedikit demi sedikit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Jangan hanya terpaku pada angka suhu saja, amati pula aktivitasnya.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Parasetamol melalu takaran aman dapat dipertimbangkan apabila suhu ≥38,5°C dan ananda tampak rewel atau tidak nyaman.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Ulangi penilaian mandiri ini bila demamnya terus naik atau Bunda mulai merasa bimbang.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <h5 className="font-display font-bold text-xs text-rose-800 flex items-start gap-2 mb-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5 animate-pulse" />
                <span>Segera ke IGD bila:</span>
              </h5>
              <p className="text-rose-700 text-[10px] leading-relaxed pl-5.5">
                Kejang, kejang berulang, sulit sadar kembali (mengantuk berat), napas berat/tersengal, sangat lemas, sulit dibangunkan, tidak mau minum sama sekali, atau ruam merah keunguan mendadak.
              </p>
            </div>
          </div>
        </div>
      )}

      {risk === 'ORANYE' && (
        <div className="bg-white rounded-2xl border border-pastel-orange-bg shadow-[0_4px_16px_rgba(230,81,0,0.04)] overflow-hidden" id="card-oranye">
          <div className="p-4 bg-pastel-orange-bg text-pastel-orange-text flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-display font-extrabold text-base shadow-sm shrink-0">
              🟠
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm">Periksa Dokter Hari Ini</h2>
              <p className="text-orange-950 text-[9.5px] opacity-90">Evaluasi Medis Dianjurkan Segera</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kesimpulan</h4>
              <p className="text-slate-800 text-xs font-bold leading-relaxed">
                Ananda sebaiknya diperiksa dokter hari ini. Saat ini belum ada tanda bahaya berat yang terdeteksi dari jawaban Bunda, tetapi kondisi demamnya perlu dievaluasi langsung oleh medis.
              </p>
            </div>

            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kenapa hasil ini muncul?</h4>
              <p className="text-slate-600 text-xs leading-relaxed space-y-1">
                <span>Hasil ini muncul karena suhu ananda relatif cukup tinggi ({wizardData.suhu}°C), demam sudah berlangsung selama {getFeverDurationLabel()}, atau pola fluktuasi naik-turun bertahan cukup lama.</span>
              </p>
              {parseFloat(wizardData.suhu) >= 40 && (
                <div className="p-2.5 bg-red-50 text-red-800 border border-red-100 rounded-xl text-[10px] mt-1 font-semibold flex items-start gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-700 shrink-0 mt-0.5 animate-pulse" />
                  <span><strong>Hiperpireksia Alert</strong>: Suhu ananda termasuk sangat tinggi (≥40°C). Walaupun belum ada tanda bahaya berat, pemeriksaan dokter hari ini sebaiknya jangan ditunda.</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Apa yang perlu dilakukan sekarang?</h4>
              <ul className="space-y-2 text-xs text-slate-650">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800">Rencanakan pemeriksaan ke dokter atau puskesmas pendaftaran hari ini juga.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Tetap pantau respons, pola napas, warna bibir, kualitas minum, dan frekuensi berkemih.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Berikan cairan sedikit-sedikit tapi sering demi menghindari dehidrasi atau muntah.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>Parasetamol dapat dipertimbangkan jika suhu tubuh mencapai ≥38,5°C agar ananda dapat beristirahat lebih tenang.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span className="text-orange-950 font-semibold">Jangan menunda pemeriksaan dokter hanya karena suhu sempat turun setelah minum obat demam.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <h5 className="font-display font-bold text-xs text-rose-800 flex items-start gap-2 mb-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5 animate-pulse" />
                <span>Segera ke IGD bila:</span>
              </h5>
              <p className="text-rose-700 text-[10px] leading-relaxed pl-5.5">
                Kejang, napas tampak berat/sesak, sulit dibangunkan, anak tampak sangat lemas, tidak mau minum sama sekali, BAK sangat sedikit hingga kering, bibir kebiruan, atau ruam merah keunguan menyebar.
              </p>
            </div>
          </div>
        </div>
      )}

      {risk === 'MERAH' && (
        <div className="bg-white rounded-2xl border border-pastel-red-bg shadow-[0_4px_16px_rgba(198,40,40,0.04)] overflow-hidden" id="card-merah">
          <div className="p-4 bg-pastel-red-bg text-pastel-red-text flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-display font-extrabold text-base shadow-sm shrink-0">
              🚨
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm text-red-800">Segera ke IGD</h2>
              <p className="text-red-900 text-[9.5px] opacity-90">Memerlukan Penanganan Cepat Sekarang</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kesimpulan</h4>
              <p className="text-red-950 text-xs font-bold leading-relaxed bg-red-50/70 p-3 rounded-xl border border-red-100">
                Dari jawaban Bunda, ada tanda bahaya merah yang perlu diperiksa segera. Sebaiknya ananda segera dibawa ke IGD atau fasilitas kesehatan terdekat sekarang juga.
              </p>
            </div>

            <div>
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">Kenapa hasil ini muncul?</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Hasil ini muncul karena Bunda mendeteksi adanya tanda-tanda yang dapat menunjukkan kondisi ananda tidak mencukupi dinilai secara mandiri melalui aplikasi handphone dan butuh visit langsung.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <h4 className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Apa yang harus dilakukan sekarang?</h4>
              <ul className="space-y-2 text-xs text-slate-705">
                <li className="flex items-start gap-2.5 font-bold text-red-700">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <span>Jangan menunggu obat bekerja atau demamnya turun dulu sebelum berangkat!</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Bawa ananda ke instalasi gawat darurat (IGD) atau klinik rawat inap terdekat segera.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Bila ananda kejang aktif, sesak napas berat, tampak tidak sadar penuh, atau kulit membiru, cari bantuan transportasi aman tanpa menunda.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Jangan memaksa memberi suapan makan atau air minum jika ananda tampak sesak atau kesadarannya melemah demi mencegah tersedak.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Siapkan informasi penting: suhu tubuh terakhir, lama durasi demam, daftar obat yang sudah diminum, jam pemberiannya, dan kartu identitas ananda.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 text-center border-t border-slate-50">
              <p className="text-[10px] text-slate-400 italic">
                Panduan ini membantu mengenali tanda bahaya dengan cepat, bukan menggantikan pemeriksaan komprehensif dokter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHECKLIST KHUSUS HASIL MERAH */}
      {risk === 'MERAH' && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3" id="checklist-merah-block">
          <div className="flex items-start gap-2.5 text-slate-700">
            <span className="text-sm mt-0.5">📋</span>
            <h4 className="font-display font-bold text-xs text-[#1e293b] leading-relaxed">Sambil bersiap ke IGD, catat bila sempat:</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10.5px] text-slate-600 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Suhu tubuh terakhir</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Apakah ada kejang</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Demam sejak kapan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Apakah napas berat</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Obat yang diberikan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Minum terakhir kapan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Jam terakhir obat</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>BAK terakhir kapan</span>
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Ada ruam merah/keunguan atau tidak</span>
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>Keluhan lain: muntah, diare, batuk, sesak, dll.</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-light">
            Catatan sederhana di atas dapat sangat membantu dokter/perawat memahami kondisi darurat ananda secara lebih cepat. <strong>Bila kondisi ananda tampak sangat tidak stabil atau gawat, mohon jangan menunda keberangkatan hanya demi melengkapi catatan fisik ini.</strong>
          </p>
        </div>
      )}

      {/* 4. PARASETAMOL ESTIMATOR TOOL (NOT SHOWN ON RED/EMERGENCY RESULTS) */}
      {risk !== 'MERAH' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_18px_rgba(0,0,0,0.015)] p-5 space-y-4" id="paracetamol-section">
          <div className="flex items-start gap-2.5 border-b border-slate-50 pb-2.5">
            <Calculator className="w-4 h-4 text-brand-teal shrink-0 mt-0.75" />
            <h3 className="font-display font-extrabold text-sm text-slate-800">
              Hitung Estimasi Dosis Parasetamol
            </h3>
          </div>

          <p className="text-slate-500 text-xs leading-relaxed">
            Parasetamol dapat dipertimbangkan bila suhu ≥38,5°C dan ananda tampak tidak nyaman.
          </p>

          {parseFloat(wizardData.suhu) < 38.5 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Rekomendasi</strong>: Saat ini aplikasi belum menyarankan perhitungan dosis parasetamol karena suhu tubuh ananda belum mencapai 38,5°C ({wizardData.suhu}°C). Fokus utama kita saat ini adalah memantau kondisi ananda, memberikan cairan yang cukup, serta mengulangi pengukuran suhu berkala bila ananda tampak semakin rewel atau hangat.</span>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Body weight */}
                <div>
                  <label htmlFor="bb-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Berat Badan Anak (kg) *
                  </label>
                  <div className="relative">
                    <input
                      id="bb-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="Contoh: 12"
                      value={bbInput}
                      onChange={(e) => handleBbChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal rounded-xl py-2.5 px-3 text-xs text-slate-800 outline-none transition"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs pointer-events-none">kg</span>
                  </div>
                </div>

                {/* Dropdown sediaan */}
                <div>
                  <label htmlFor="sediaan-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sediaan Penurun Demam (Parasetamol)
                  </label>
                  <select
                    id="sediaan-select"
                    value={selectedSediaan}
                    onChange={(e) => handleSediaanChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal rounded-xl py-2.5 px-2.5 text-xs text-slate-700 outline-none transition"
                  >
                    {PARASETAMOL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {bbError && (
                <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{bbError}</span>
                </p>
              )}

              {/* Outcome result calculation box */}
              {calculatedDose && !bbError && (
                <div className="p-5 rounded-2xl bg-brand-cream border border-brand-teal/80 space-y-4 shadow-[0_10px_25px_rgba(95,183,185,0.06)] animate-fade-in" id="paracetamol-result-info">
                  {selectedSediaan === 'TIDAK_YAKIN' ? (
                    <div className="text-slate-700 text-[11px] leading-relaxed flex items-start gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span><strong>Aplikasi tidak menghitung dosis mL karena konsentrasi obat belum jelas.</strong> Mohon periksa kembali label pada kotak kemasan obat Anda, atau tanyakan langsung apoteker/tenaga kesehatan tentang takarannya.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-left">
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hasil Estimasi Dosis:</div>
                      <div className="text-slate-800 font-display text-base font-extrabold flex justify-between">
                        <span>Dosis:</span>
                        <span className="text-brand-teal-dark">{calculatedDose.mg} mg per kali minum</span>
                      </div>
                      
                      {calculatedDose.ml !== null && (
                        <div className="text-slate-800 font-display text-sm font-bold flex justify-between border-t border-brand-teal-light pt-1.5 mt-1">
                          <span>Setara:</span>
                          <span className="text-brand-teal-dark">{calculatedDose.ml} mL tiap kali minum</span>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-500/90 text-right mt-1">
                        Sediaan obat terpilih: {PARASETAMOL_OPTIONS.find(o => o.id === selectedSediaan)?.label}
                      </p>
                    </div>
                  )}

                  {/* Informational warnings */}
                  <div className="border-t border-brand-teal-light/60 pt-2.5 text-[10px] text-slate-650 space-y-2 font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-brand-teal shrink-0 mt-0.5" />
                      <span>Dapat diberikan tiap 4–6 jam bila diperlukan. Maksimal pemberian sebanyak 4 kali dalam kurun waktu 24 jam.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-brand-teal shrink-0 mt-0.5" />
                      <span>Selalu gunakan spuit (takaran jarum suntik tanpa jarum) atau pipet takar agar takaran obat lebih akurat. Jangan menggunakan sendok makan makan rumah biasa.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-brand-teal shrink-0 mt-0.5" />
                      <span>Jangan digabung atau dicampur dengan obat resep dokter lain yang juga mengandung zat aktif parasetamol guna menghindari dosis ganda.</span>
                    </div>
                    {risk === 'ORANYE' && (
                      <div className="flex items-start gap-2.5 text-amber-900 bg-amber-50/80 p-2.5 border border-amber-100 rounded-xl mt-1.5 text-[9.5px]">
                        <AlertOctagon className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <span><strong>Peringatan Penting</strong>: Jangan menunda pemeriksaan dokter hari ini hanya karena suhu tubuh ananda sempat turun setelah meminum obat penurun demam ini.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. DR. ZULIA'S RECOMMENDED E-BOOK CARDS (SHOWN IN THE NORMAL ORDER FOR GREEN/YELLOW/ORANGE) */}
      {risk !== 'MERAH' && renderEBooks(false)}

      {/* 6. WHATSAPP AUTOMATED SHARER BUTTON */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-2.5" id="whatsapp-share-block">
        <div className="flex items-start gap-3">
          <Share2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.75" />
          <div className="space-y-0.5 text-left">
            <h4 className="font-display font-bold text-[11px] text-slate-800">Simpan Ringkasan Hasil</h4>
            <p className="text-slate-500 text-[9.5px] leading-relaxed">
              Bunda bisa menyimpan ringkasan hasil ini ke WhatsApp agar mudah dibaca ulang atau dibagikan ke keluarga.
            </p>
          </div>
        </div>

        <a
          href={generateWhatsAppShare()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold rounded-lg text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-sm text-center font-bold"
          id="send-to-whatsapp-btn"
        >
          <span>Kirim ke WhatsApp</span>
        </a>

        <p className="text-center text-[8.5px] text-slate-400">
          🔒 Aplikasi ini tidak memerlukan, menyimpan, atau membagikan nomor WhatsApp Bunda.
        </p>
      </div>

      {/* 7. RED RISK: EMBEDDED RECOMMENDED E-BOOKS AT THE VERY BOTTOM OF THE RESULTS PAGE (LESS DOMINANT) */}
      {risk === 'MERAH' && renderEBooks(true)}

      {/* Bottom Repeat Reset Option */}
      <div className="pt-6 pb-2 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 py-2.5 px-6 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white text-slate-600 text-xs font-semibold hover:text-slate-800 transition shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          id="repeat-guidance-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ulangi Penilaian Mandiri</span>
        </button>
      </div>
    </div>
  );
}
