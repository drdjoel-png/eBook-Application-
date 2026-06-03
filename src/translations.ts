/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LangType = 'id' | 'en';

export const translations = {
  id: {
    app: {
      title: 'PediaCare',
      tagline: 'Cek Gejala Sakit Anak',
      freeBadge: 'Gratis digunakan',
      copyright: '© 2026 PediaCare',
      disclaimerShort: 'Panduan interaktif ini membantu mengenali tingkat risiko awal saat ananda sakit. Panduan ini bukan diagnosis dan bukan pengganti pemeriksaan dokter.',
    },
    disclaimer: {
      badge: 'PediaCare',
      title: 'Cek Gejala Sakit Anak',
      subtitle: 'Bantu Bunda menilai gejala sakit ananda dengan tenang: kapan cukup dipantau, kapan perlu dokter, dan kapan harus ke IGD.',
      point1Title: 'Tanpa login',
      point1Desc: 'Akses cepat saat dibutuhkan',
      point2Title: 'Tidak perlu nama anak',
      point2Desc: 'Privasi tetap terjaga',
      point3Title: 'Tidak menyimpan data',
      point3Desc: 'Isi jawaban hanya dipakai untuk panduan saat ini',
      point4Title: 'Fokus pada tanda bahaya',
      point4Desc: 'Membantu Bunda mengenali kondisi yang perlu diperhatikan',
      headerNotice: 'Panduan tingkat risiko awal',
      noticeDesc: 'Panduan ini membantu mengenali tingkat risiko awal. Aplikasi ini bukan diagnosis dan bukan pengganti pemeriksaan dokter.',
      btnAccept: 'Saya mengerti, mulai',
    },
    landing: {
      title: 'PediaCare: Cek Gejala Sakit Anak',
      subtitle: 'Tekan salah satu menu gejala utama di bawah untuk memulai panduan interaktif yang spesifik.',
      menuDemamTitle: 'Anak Demam',
      menuDemamDesc: 'Evaluasi suhu tubuh, resiko kejang, serta perhitungan dosis Parasetamol.',
      menuMuntahTitle: 'Anak Muntah / Diare',
      menuMuntahDesc: 'Deteksi tingkat dehidrasi, kalkulator kebutuhan cairan pelarut & Oralit.',
      menuBatukTitle: 'Anak Batuk / Sesak',
      menuBatukDesc: 'Skrining laju napas dengan Alat Hitung Tap, deteksi suara mengi & penanganan.',
      valuePropTitle: 'KEUNGGULAN PEDIACARE',
      valuePropSubtitle: 'Mengapa Bunda Membutuhkan Panduan Ini?',
      benefit1Title: 'Baca suhu & tanda dengan konteks',
      benefit1Desc: 'Suhu penting, tapi keputusan asuhan kesehatan yang bijaksana tidak boleh hanya ditentukan dari angka termometer saja.',
      benefit2Title: 'Cek tanda bahaya terpadu',
      benefit2Desc: 'Kondisi respons kesadaran, kerja napas, warna bibir, dan tanda penting lainnya didahulukan untuk dievaluasi awal.',
      benefit3Title: 'Arahan penanganan jelas',
      benefit3Desc: 'Bunda dibantu memahami secara tenang kapan cukup dipantau mandiri, kapan wajib periksa dokter, dan kapan harus segera ke IGD.',
    }
  },
  en: {
    app: {
      title: 'PediaCare',
      tagline: 'Child Symptom Checker',
      freeBadge: 'Free to use',
      copyright: '© 2026 PediaCare',
      disclaimerShort: 'This interactive tool helps recognize initial risks when your child is sick. It is not a diagnosis and not a replacement for a doctor.',
    },
    disclaimer: {
      badge: 'PediaCare',
      title: 'Child Symptom Checker',
      subtitle: 'Help parents assess child symptoms calmly: when to monitor, when to see a doctor, and when to go to the emergency room.',
      point1Title: 'No login required',
      point1Desc: 'Quick access when needed most',
      point2Title: 'No child name needed',
      point2Desc: 'Your privacy is secured',
      point3Title: 'No data stored',
      point3Desc: 'Your answers are only used for current guidance',
      point4Title: 'Focus on danger signs',
      point4Desc: 'Helping you recognize conditions that need immediate attention',
      headerNotice: 'Initial risk level guidance',
      noticeDesc: 'This guide helps recognize initial risk levels. This app is not a diagnosis and does not replace medical consultation.',
      btnAccept: 'I understand, start',
    },
    landing: {
      title: 'PediaCare: Child Symptom Checker',
      subtitle: 'Select one of the main symptoms below to start a specific, step-by-step interactive guidance.',
      menuDemamTitle: 'Fever',
      menuDemamDesc: 'Evaluate body temperature, seizure risk, and precise Paracetamol dosage calculation.',
      menuMuntahTitle: 'Vomiting / Diarrhea',
      menuMuntahDesc: 'Detect dehydration status, calculate fluid replacements & Oralit reconstitution.',
      menuBatukTitle: 'Cough / Shortness of Breath',
      menuBatukDesc: 'Screen breathing rate with the interactive Tap Counter, screen wheezing & care tips.',
      valuePropTitle: 'PEDIACARE ADVANTAGES',
      valuePropSubtitle: 'Why Do You Need This Guide?',
      benefit1Title: 'Assess symptoms in context',
      benefit1Desc: 'Temperature is vital, but wise care decisions should never be determined solely by a thermometer reading.',
      benefit2Title: 'Integrated screening of danger',
      benefit2Desc: 'Neurological response, breathing effort, hydration level, and other danger signs are prioritized first.',
      benefit3Title: 'Clear actionable steps',
      benefit3Desc: 'We help you understand calmly when to monitor safely at home, when to visit a clinic, and when to rush to the ER.',
    }
  }
};
