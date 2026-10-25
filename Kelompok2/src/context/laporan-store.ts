import { useMemo, useSyncExternalStore } from 'react';
import type { Akta, AktaInput, LaporanSummary, ValidasiItem } from '@/types/laporan';
import { formatDateId, parseInputDate } from '@/utils/date';

/**
 * Semua logika & data fitur Laporan/Repertorium dalam satu file:
 * konstanta, helper tanggal, data contoh, store (di memori), dan hook `useLaporan`.
 * Saat backend (Supabase) tersedia, cukup ganti isi bagian "Data contoh" dan "Store".
 */

// ───────────────────────── Konstanta & helper ─────────────────────────

export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export const TAHUN_OPSI = ['2024', '2025', '2026', '2027', '2028'] as const;

/** Kategori yang harus dikonfirmasi bila tidak punya data pada periode berjalan. */
export const KATEGORI_VALIDASI = ['Waarmerking', 'Akta Jaminan Fidusia'] as const;

export const JENIS_AKTA = [
  'Pendirian PT',
  'Akta Jual Beli',
  'Perjanjian Kredit',
  'Waarmerking',
  'Akta Jaminan Fidusia',
] as const;

export const SIFAT_AKTA = ['Minuta', 'Salinan', 'Kutipan'] as const;
export const STATUS_AKTA = ['Terbit', 'Draf'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Apakah tanggal akta (DD-MM-YYYY) jatuh pada bulan (0-11) dan tahun tertentu. */
export function isInPeriode(tanggal: string, bulan: number, tahun: number): boolean {
  const date = parseInputDate(tanggal);
  return !!date && date.getMonth() === bulan && date.getFullYear() === tahun;
}

/** "12-03-2026" → "12 Mar 2026". Mengembalikan teks asli bila tidak valid. */
export function formatTanggalAkta(tanggal: string): string {
  const date = parseInputDate(tanggal);
  return date ? formatDateId(date) : tanggal;
}

/** Date → "Hari ini, 10.12". */
export function formatDiperbarui(date: Date): string {
  return `Hari ini, ${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/** Hari ini dalam format input aplikasi (DD-MM-YYYY). */
export function todayInput(): string {
  const now = new Date();
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
}

// ───────────────────────── Data contoh (sementara, sebelum backend tersedia) ─────────────────────────

/** Data contoh Repertorium (sementara, sebelum backend tersedia). */
export const aktaData: Akta[] = [
  {
    id: 'AK-1',
    nomorUrut: '001',
    nomorAkta: '12/2026',
    tanggal: '12-03-2026',
    jenis: 'Pendirian PT',
    pihak: 'PT Nusa Karya Sentosa',
    sifat: 'Minuta',
    status: 'Terbit',
    catatan: 'Telah dicatat dan diperiksa.',
  },
  {
    id: 'AK-2',
    nomorUrut: '002',
    nomorAkta: '13/2026',
    tanggal: '17-03-2026',
    jenis: 'Akta Jual Beli',
    pihak: 'Sri Rahmawati & Andre Wijaya',
    sifat: 'Minuta',
    status: 'Terbit',
    catatan: '',
  },
  {
    id: 'AK-3',
    nomorUrut: '003',
    nomorAkta: '14/2026',
    tanggal: '19-03-2026',
    jenis: 'Perjanjian Kredit',
    pihak: 'Hadi Kurniawan',
    sifat: 'Minuta',
    status: 'Draf',
    catatan: '',
  },
  // Sengaja di luar periode Maret: contoh peringatan "data di luar periode".
  {
    id: 'AK-4',
    nomorUrut: '004',
    nomorAkta: '15/2026',
    tanggal: '02-04-2026',
    jenis: 'Akta Jual Beli',
    pihak: 'CV Mitra Abadi',
    sifat: 'Minuta',
    status: 'Terbit',
    catatan: '',
  },
];

// ───────────────────────── Store ─────────────────────────

/**
 * Penyimpanan state Laporan & Repertorium (sementara di memori).
 * Dipakai bersama layar Laporan dan Repertorium agar perubahan periode, konfirmasi
 * kategori, dan koreksi akta langsung terlihat di keduanya.
 *
 * Sengaja memakai store ringan (tanpa Provider) supaya `app/_layout.tsx` milik tim tidak
 * perlu diubah. Saat backend (Supabase) tersedia, cukup ganti isi fungsi di file ini.
 */
interface LaporanState {
  /** 0-11 */
  bulan: number;
  tahun: number;
  akta: Akta[];
  kategoriKosong: string[];
  diperbarui: Date;
}

let state: LaporanState = {
  bulan: 2,
  tahun: 2026,
  akta: aktaData,
  kategoriKosong: [],
  diperbarui: new Date(),
};

const listeners = new Set<() => void>();

function emit(patch: Partial<LaporanState>) {
  state = { ...state, ...patch, diperbarui: new Date() };
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => state;

export function useLaporanStore(): LaporanState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setPeriode(bulan: number, tahun: number) {
  emit({ bulan, tahun });
}

export function confirmKategoriKosong(kategori: string[]) {
  emit({ kategoriKosong: [...new Set([...state.kategoriKosong, ...kategori])] });
}

let sequence = 0;

export function addAkta(input: AktaInput) {
  const created: Akta = { id: `AK-${Date.now()}-${sequence++}`, ...input };
  emit({ akta: [...state.akta, created] });
}

export function updateAkta(id: string, input: AktaInput) {
  emit({ akta: state.akta.map((a) => (a.id === id ? { id, ...input } : a)) });
}

/** Nomor urut berikutnya (001, 002, ...) untuk form tambah akta. */
export function nextNomorUrut(): string {
  return String(state.akta.length + 1).padStart(3, '0');
}

// ───────────────────────── Hook ringkasan laporan ─────────────────────────

interface UseLaporan {
  summary: LaporanSummary;
  /** Akta yang tanggalnya jatuh pada periode terpilih. */
  aktaPeriode: Akta[];
  /** Jumlah akta di luar periode terpilih. */
  luarPeriode: number;
}

/** Menghitung ringkasan Laporan Bulanan dan validasinya dari data Repertorium. */
export function useLaporan(): UseLaporan {
  const { bulan, tahun, akta, kategoriKosong, diperbarui } = useLaporanStore();

  return useMemo(() => {
    const aktaPeriode = akta.filter((a) => isInPeriode(a.tanggal, bulan, tahun));
    const aktaLengkap = aktaPeriode.every((a) => a.nomorAkta && a.pihak && a.jenis);

    const validasi: ValidasiItem[] = [
      {
        id: 'daftar-akta',
        judul: 'Daftar Akta',
        deskripsi: aktaLengkap
          ? 'Semua field sesuai ketentuan'
          : 'Ada akta dengan data belum lengkap',
        status: aktaLengkap ? 'Lengkap' : 'Tinjau',
      },
      ...KATEGORI_VALIDASI.map((kategori): ValidasiItem => {
        const adaData = aktaPeriode.some((a) => a.jenis === kategori);
        const dikonfirmasi = kategoriKosong.includes(kategori);
        return {
          id: kategori,
          judul: kategori,
          deskripsi: adaData
            ? 'Data tersedia pada periode ini'
            : dikonfirmasi
              ? 'Dikonfirmasi tidak memiliki data'
              : 'Kategori kejadian belum dikonfirmasi',
          status: adaData || dikonfirmasi ? 'Lengkap' : 'Tinjau',
        };
      }),
    ];

    const lengkap = validasi.filter((v) => v.status === 'Lengkap').length;

    const summary: LaporanSummary = {
      periodeLabel: `${BULAN[bulan]} ${tahun}`,
      diperbaruiLabel: formatDiperbarui(diperbarui),
      progress: Math.round((lengkap / validasi.length) * 100),
      stats: {
        jumlahAkta: aktaPeriode.length,
        selesai: aktaPeriode.filter((a) => a.status === 'Terbit').length,
        perluTinjau: validasi.length - lengkap,
      },
      validasi,
    };

    return { summary, aktaPeriode, luarPeriode: akta.length - aktaPeriode.length };
  }, [bulan, tahun, akta, kategoriKosong, diperbarui]);
}