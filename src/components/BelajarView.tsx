/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, ChevronLeft, ArrowRight, Heart } from 'lucide-react';
import { ScreenType } from '../types';

interface BelajarViewProps {
  onNavigate: (screen: ScreenType) => void;
  onStartFeverCheck: () => void;
}

export default function BelajarView({ onNavigate, onStartFeverCheck }: BelajarViewProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between animate-fade-in" id="education-screen">
      <div>
        {/* Back Button */}
        <button
          onClick={() => onNavigate('LANDING')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-teal transition mt-1 mb-3"
          id="back-to-landing-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        {/* Styled Book Cover Header representing "Panduan Orang Tua Mengambil Keputusan" */}
        <div className="mb-4 flex justify-center" id="book-cover-container">
          <div className="w-full max-w-[260px] bg-[#FAF8F5] border-2 border-slate-200/50 rounded-2xl shadow-md overflow-hidden flex flex-col relative transition-all duration-300" id="physical-book-mockup">
            {/* Book spine simulation with gradient overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 via-black/5 to-transparent z-10" />
            <div className="absolute left-[12px] top-0 bottom-0 w-[1px] bg-slate-200 z-10" />
            <div className="absolute right-[5px] top-[4px] bottom-[4px] w-[1px] bg-black/5 rounded-full z-10" />

            {/* Book Cover content */}
            <div className="p-4 pl-6 flex-grow flex flex-col justify-between min-h-[250px] text-center select-none bg-gradient-to-br from-[#FCFAF6] to-[#F5F1E9]">
              
              {/* Header Text Group */}
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#111827] text-[11px] leading-snug tracking-wide uppercase px-1">
                  Panduan Orang Tua Mengambil Keputusan Saat Anak Sakit Di Rumah
                </h3>
                <p className="text-[8px] text-slate-500 font-medium leading-relaxed max-w-[190px] mx-auto px-1 border-t border-slate-200/50 pt-1 mt-1">
                  Untuk membantu keluarga tetap tenang menghadapi demam, kejang, dan diare — tanpa menunggu sampai terlambat
                </p>
              </div>

              {/* Heartwarming Mother & Sick Child Bedroom Illustration in SVG */}
              <div className="my-2 bg-white/70 backdrop-blur-[1px] rounded-xl p-2 border border-slate-200/30 flex items-center justify-center relative overflow-hidden h-[90px] shadow-inner font-sans">
                <svg className="w-20 h-full text-slate-700" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Styled Bed Frame & Headboard */}
                  <rect x="15" y="45" width="90" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="15" y="25" width="6" height="26" rx="1" fill="#CBD5E1" />
                  
                  {/* Pillows */}
                  <rect x="22" y="32" width="18" height="10" rx="2" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
                  
                  {/* Cozied Sleeping Toddler */}
                  <g id="sleeping-child">
                    {/* Head */}
                    <circle cx="34" cy="31" r="5" fill="#FED7AA" />
                    {/* Brown hair */}
                    <path d="M30 28C32 26 36 27 38 31" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M31 29C32 28 35 28 36 30" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
                    {/* Closed eye */}
                    <path d="M35 32C34.5 32.5 33.5 32.5 33 32" stroke="#475569" strokeWidth="0.8" />
                    {/* Pink Cozy Blanket */}
                    <path d="M30 36C30 36 50 35 75 35C75 42 75 45 75 45H30V36Z" fill="#FCE4EC" />
                    <line x1="30" y1="36" x2="75" y2="36" stroke="#F8BBD0" strokeWidth="1.5" />
                  </g>

                  {/* Mother Sitting & Caring */}
                  <g id="caring-mother">
                    {/* Mom torso & clothes */}
                    <path d="M78 51C75 39 80 28 88 28C96 28 98 40 98 51H78Z" fill="#E0F2F1" />
                    {/* Mom neck */}
                    <rect x="85" y="23" width="4" height="6" fill="#FED7AA" />
                    {/* Mom head */}
                    <circle cx="87" cy="20" r="6.5" fill="#FED7AA" />
                    {/* Long hair */}
                    <path d="M80.5 18C80 25 84 27 84 27C84 27 86.5 14 91 16C94.5 17.5 94.2 26 93 27C94 25.5 95 21 93.5 17.5C92 14 85.5 13.5 81 16.5" fill="#451A03" />
                    {/* Mother's caring arm touching child / bed */}
                    <path d="M82 35C72 35 62 33 50 38" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Mother's sleeve */}
                    <path d="M81 31C78 33 76 35 76 35" stroke="#B2DFDB" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  
                  {/* Healing floating heart */}
                  <path d="M56 18C56 16.343 54.657 15 53 15C51.343 15 50 16.343 50 18C50 20 53 23 56 25C59 23 62 20 62 18C62 16.343 60.657 15 59 15C57.343 15 56 16.343 56 18Z" fill="#F43F5E" fillOpacity="0.45" />
                </svg>
              </div>

              {/* Author Segment */}
              <div className="space-y-0.5 mt-auto">
                <span className="text-[10px] font-bold text-slate-800 tracking-wider block border-b border-rose-200 w-fit mx-auto pb-0.5 uppercase">
                  Zulia Ahmad Burhani
                </span>
                <span className="text-[7.5px] text-slate-400 font-medium block leading-tight max-w-[190px] mx-auto">
                  dokter spesialis anak & pendamping orang tua saat anak sakit
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Introduction text */}
        <div className="mb-3 text-center">
          <h2 className="font-display text-xs font-bold text-slate-700">
            Materi Edukasi & Pengambilan Keputusan
          </h2>
          <p className="text-slate-500 text-[10px] mt-0.5">
            Dirangkum dari buku panduan ilmiah tepercaya oleh dokter spesialis anak:
          </p>
        </div>

        {/* 3 Main Educational Points */}
        <div className="space-y-2">
          {/* Point 1 */}
          <div className="bg-brand-card p-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0 font-display font-bold text-xs shadow-sm">
              1
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-800 text-[11px] leading-snug">
                Jangan hanya melihat angka suhu
              </h4>
              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                Suhu tubuh penting, namun bukanlah satu-satunya acuan keparahan demam anak.
              </p>
            </div>
          </div>

          {/* Point 2 */}
          <div className="bg-brand-card p-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0 font-display font-bold text-xs shadow-sm">
              2
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-800 text-[11px] leading-snug">
                Lihat kondisi anak secara utuh
              </h4>
              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                Perhatikan respons (aktif/lemas), kerja napas, warna bibir/kulit, serta asupan air & frekuensi berkemih.
              </p>
            </div>
          </div>

          {/* Point 3 */}
          <div className="bg-brand-card p-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0 font-display font-bold text-xs shadow-sm">
              3
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-800 text-[11px] leading-snug">
                Bila ragu, jangan menunggu sendirian
              </h4>
              <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                Jika ada tanda yang membuat Bunda kurang tenang, selalu lebih aman segera periksakan ananda ke dokter.
              </p>
            </div>
          </div>
        </div>

        {/* Note block */}
        <div className="mt-4 p-3 bg-orange-50/70 border border-orange-100 rounded-xl flex items-start gap-2.5">
          <Heart className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-orange-800 leading-relaxed">
            Menilai gejala anak dengan kepala dingin membantu Bunda bertindak lebih sigap dan tepat sasaran. Mari coba cek status kriteria demam ananda dengan panduan interaktif berikut ini.
          </p>
        </div>
      </div>

      {/* Footer / Call to action */}
      <div className="mt-5 space-y-3">
        <button
          onClick={onStartFeverCheck}
          className="w-full py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-display font-semibold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm"
          id="start-fever-check-btn"
        >
          <span>Mulai cek demam</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <p className="text-center text-[9px] text-slate-400">
          ⚠️ Panduan edukasi ini tidak ditujukan untuk menggantikan saran profesional medis.
        </p>
      </div>
    </div>
  );
}
