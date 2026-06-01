/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'LANDING' | 'BELAJAR' | 'WIZARD' | 'HASIL';

export interface TandaBahayaState {
  respons: 'TIDAK' | 'ADA' | null;
  napas: 'TIDAK' | 'ADA' | null;
  minumBak: 'TIDAK' | 'ADA' | null;
  tandaLain: 'TIDAK' | 'ADA' | null;
}

export type CaraUkurType = 'KETIAK' | 'DAHI' | 'TELINGA' | 'REKTAL' | 'TIDAK_YAKIN';

export type LamaDemamType = 'KURANG_24_JAM' | '1_2_HARI' | '3_HARI_LEBIH' | 'LEBIH_5_HARI_NAIK_TURUN';

export type RiwayatKejangType = 'TIDAK_PERNAH' | 'PERNAH' | 'TIDAK_YAKIN';

export interface WizardData {
  tandaBahaya: TandaBahayaState;
  usiaTahun: number | '';
  usiaBulan: number | '';
  suhu: string; // temperature input as string to allow decimal typing
  caraUkur: CaraUkurType | null;
  lamaDemam: LamaDemamType | null;
  riwayatKejang: RiwayatKejangType | null;
}

export type RiskLevel = 'HIJAU' | 'KUNING' | 'ORANYE' | 'MERAH';

export interface ParasetamolSediaan {
  id: 'DROPS_100' | 'SIRUP_120' | 'SIRUP_160' | 'SIRUP_250' | 'TIDAK_YAKIN';
  label: string;
  mgPerMl: number; // concentration in mg/mL
}

export const PARASETAMOL_OPTIONS: ParasetamolSediaan[] = [
  { id: 'DROPS_100', label: 'Drops (100 mg / mL)', mgPerMl: 100 },
  { id: 'SIRUP_120', label: 'Sirup (120 mg / 5 mL)', mgPerMl: 24 },
  { id: 'SIRUP_160', label: 'Sirup (160 mg / 5 mL)', mgPerMl: 32 },
  { id: 'SIRUP_250', label: 'Sirup (250 mg / 5 mL)', mgPerMl: 50 },
  { id: 'TIDAK_YAKIN', label: 'Tidak yakin / Sediaan berbeda', mgPerMl: 0 },
];
