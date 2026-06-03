/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'LANDING' | 'BELAJAR' | 'WIZARD' | 'HASIL';
export type ModuleType = 'DEMAM' | 'MUNTAH_DIARE' | 'BATUK_SESAK';

export interface TandaBahayaState {
  respons: 'TIDAK' | 'ADA' | 'RAGU' | null;
  napas: 'TIDAK' | 'ADA' | 'RAGU' | null;
  minumBak: 'TIDAK' | 'ADA' | 'RAGU' | null;
  tandaLain: 'TIDAK' | 'ADA' | 'RAGU' | null;
}

// 3-in-1 Wizard Data State
export interface WizardData {
  selectedModule: ModuleType | null;

  // Module 1: Muntah / Diare
  mdTandaBahaya: {
    letargis: 'TIDAK' | 'ADA' | null;
    mataCekung: 'TIDAK' | 'ADA' | null;
    muntahSemua: 'TIDAK' | 'ADA' | null;
    tidakPipis: 'TIDAK' | 'ADA' | null;
  };
  mdBeratBadan: string;
  mdUsiaTahun: string;
  mdUsiaBulan: string;
  mdDurasi: 'KURANG_5_HARI' | 'LEBIH_5_HARI' | null;
  mdFrekuensi: 'JARANG' | 'SERING' | null;
  mdResponsMinum: 'NORMAL' | 'HAUS' | 'MALAS_MINUM' | null;
  mdKondisiMata: 'NORMAL' | 'CEKUNG' | null;
  mdUbunUbun: 'NORMAL' | 'CEKUNG' | null;
  mdFrekuensiBabMuntah: string;

  // Module 2: Batuk / Sesak
  bsTandaBahaya: {
    sianosis: 'TIDAK' | 'ADA' | null;
    stridor: 'TIDAK' | 'ADA' | null;
    tarikanDindingDada: 'TIDAK' | 'ADA' | null;
    tidakMauMinum: 'TIDAK' | 'ADA' | null;
  };
  bsUsiaGroup: 'KURANG_2_BULAN' | '2_11_BULAN' | '1_5_TAHUN' | null;
  bsBeratBadan: string;
  bsDurasi: 'KURANG_14_HARI' | 'LEBIH_14_HARI' | null;
  bsSuaraMengi: 'YA' | 'TIDAK' | null;
  bsLajuNapas: number; // calculated from tap counter

  // Module 3: Demam
  demamTandaBahaya: {
    kejangAktif: 'TIDAK' | 'ADA' | null;
    kakuKuduk: 'TIDAK' | 'ADA' | null;
    kesadaranMenurun: 'TIDAK' | 'ADA' | null;
    bintikMerah: 'TIDAK' | 'ADA' | null;
  };
  demamUsiaGroup: 'KURANG_3_BULAN' | '3_BULAN_5_TAHUN' | 'LEBIH_5_TAHUN' | null;
  demamBeratBadan: string;
  demamSuhu: string;
  demamLama: 'BARU' | '1_2_HARI' | '3_HARI_LEBIH' | null;
  demamRiwayatKejang: 'TIDAK_PERNAH' | 'PERNAH' | 'TIDAK_YAKIN' | null;
  demamTerakhirObat: 'BELUM_ATAU_LEBIH_4_JAM' | 'KURANG_4_JAM' | null;
}

export type RiskLevel = 'HIJAU' | 'KUNING' | 'ORANYE' | 'MERAH' | 'RAGU';

export interface ParasetamolSediaan {
  id: 'DROPS_100' | 'SIRUP_120' | 'SIRUP_160' | 'SIRUP_250' | 'TIDAK_YAKIN';
  label: string;
  labelEn?: string;
  mgPerMl: number; // concentration in mg/mL
}

export const PARASETAMOL_OPTIONS: ParasetamolSediaan[] = [
  { id: 'DROPS_100', label: 'Drops (100 mg / mL)', labelEn: 'Drops / Liquid infant drops (100 mg / mL)', mgPerMl: 100 },
  { id: 'SIRUP_120', label: 'Sirup (120 mg / 5 mL)', labelEn: 'Syrup / Liquid (120 mg / 5 mL)', mgPerMl: 24 },
  { id: 'SIRUP_160', label: 'Sirup (160 mg / 5 mL)', labelEn: 'Syrup / Liquid (160 mg / 5 mL)', mgPerMl: 32 },
  { id: 'SIRUP_250', label: 'Sirup (250 mg / 5 mL)', labelEn: 'Syrup / Liquid (250 mg / 5 mL)', mgPerMl: 50 },
  { id: 'TIDAK_YAKIN', label: 'Tidak yakin / Sediaan berbeda', labelEn: 'Not sure / different concentration', mgPerMl: 0 },
];
