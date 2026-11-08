import { useMemo, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import {
  ambilDokumen,
  ambilKonfirmasi,
  ambilSemuaAkta,
  mintaRevisiDb,
  setujuiLaporanDb,
  simpanKonfirmasi,
  tambahAktaDb,
  ubahAktaDb,
} from '@/lib/laporan-api';
import { supabase } from '@/lib/supabase';
import type {Akta, AktaInput, DokumenLaporan, LaporanSummary, NamaTemplate, ValidasiItem,} from '@/types/laporan';
import { formatDateId, parseInputDate } from '@/utils/date';

/**
 * Semua logika & data fitur Laporan/Repertorium dalam satu file:
 * konstanta, helper tanggal, data contoh, store (di memori), dan hook `useLaporan`.
 * Data dibaca dari dan disimpan ke Supabase (lihat `lib/laporan-api.ts`).
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

// ───────────────────────── Store ─────────────────────────

/**
 * State Laporan & Repertorium. Sumber data: Supabase. Store ini hanya menyimpan salinan
 * di memori supaya layar Laporan dan Repertorium selalu sinkron.
 *
 * Tanpa Provider (supaya `app/_layout.tsx` milik tim tidak perlu diubah). Data dimuat otomatis
 * saat pengguna login dan dikosongkan saat logout (lihat `onAuthStateChange` di bawah).
 */
interface LaporanState {
  /** 0-11 */
  bulan: number;
  tahun: number;
  akta: Akta[];
  /** Kategori yang sudah dikonfirmasi kosong pada periode aktif. */
  kategoriKosong: string[];
  diperbarui: Date;
  /** Status dokumen laporan per periode (kunci: lihat `kunciPeriode`). */
  dokumen: Record<string, DokumenLaporan>;
  /** Template format dokumen yang sedang dipakai. */
  templateId: NamaTemplate;
  /** True sementara data sedang diambil dari server. */
  memuat: boolean;
  /** True setelah data pertama berhasil dimuat. */
  dimuat: boolean;
}

function stateAwal(): LaporanState {
  const sekarang = new Date();
  return {
    bulan: sekarang.getMonth(),
    tahun: sekarang.getFullYear(),
    akta: [],
    kategoriKosong: [],
    diperbarui: new Date(),
    dokumen: {},
    templateId: 'Ringkas',
    memuat: false,
    dimuat: false,
  };
}

let state: LaporanState = stateAwal();

const listeners = new Set<() => void>();

/** Perubahan pada bagian ini dianggap "data diperbarui" (untuk label Terakhir diperbarui). */
const BAGIAN_DATA: (keyof LaporanState)[] = ['akta', 'dokumen', 'kategoriKosong'];

function emit(patch: Partial<LaporanState>) {
  const dataBerubah = BAGIAN_DATA.some((kunci) => kunci in patch);
  state = { ...state, ...patch, ...(dataBerubah ? { diperbarui: new Date() } : {}) };
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

/** Tampilkan kegagalan ke pengguna tanpa mengubah layar yang sudah ada. */
function lapor(judul: string, error: unknown) {
  const pesan = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga.';
  console.warn(`[laporan] ${judul}: ${pesan}`);
  Alert.alert(judul, pesan);
}

// ───────────────────────── Memuat data dari Supabase ─────────────────────────

async function muatAkta() {
  emit({ akta: await ambilSemuaAkta() });
}

async function muatDokumen() {
  emit({ dokumen: await ambilDokumen() });
}

async function muatKonfirmasi() {
  const { bulan, tahun } = state;
  const kategori = await ambilKonfirmasi(bulan, tahun);
  // Abaikan hasil lama bila pengguna sudah pindah periode.
  if (bulan === state.bulan && tahun === state.tahun) emit({ kategoriKosong: kategori });
}

/** Muat ulang seluruh data. Dipanggil otomatis saat login; boleh dipanggil manual (tarik-segarkan). */
export async function muatSemua() {
  emit({ memuat: true });
  try {
    await Promise.all([muatAkta(), muatDokumen(), muatKonfirmasi()]);
    emit({ memuat: false, dimuat: true });
  } catch (error) {
    emit({ memuat: false });
    lapor('Gagal memuat data laporan', error);
  }
}

// Mengikuti sesi login: muat saat masuk, kosongkan saat keluar.
let penggunaTermuat: string | null = null;
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    penggunaTermuat = null;
    state = stateAwal();
    listeners.forEach((listener) => listener());
    return;
  }
  const id = session?.user?.id;
  if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && id && id !== penggunaTermuat) {
    penggunaTermuat = id;
    // Jangan memanggil Supabase langsung di dalam callback ini (bisa menggantung).
    setTimeout(() => void muatSemua(), 0);
  }
});

// ───────────────────────── Aksi: periode, konfirmasi, akta ─────────────────────────

export function setPeriode(bulan: number, tahun: number) {
  emit({ bulan, tahun, kategoriKosong: [] });
  muatKonfirmasi().catch((error) => lapor('Gagal memuat konfirmasi kategori', error));
}

export function confirmKategoriKosong(kategori: string[]) {
  const { bulan, tahun } = state;
  emit({ kategoriKosong: [...new Set([...state.kategoriKosong, ...kategori])] });
  simpanKonfirmasi(bulan, tahun, kategori).catch(async (error) => {
    lapor('Konfirmasi gagal disimpan', error);
    await muatKonfirmasi().catch(() => undefined);
  });
}

export async function addAkta(input: AktaInput): Promise<boolean> {
  try {
    await tambahAktaDb(input);
    await muatAkta();
    return true;
  } catch (error) {
    lapor('Akta gagal disimpan', error);
    return false;
  }
}

export async function updateAkta(id: string, input: AktaInput): Promise<boolean> {
  try {
    await ubahAktaDb(id, input);
    await muatAkta();
    return true;
  } catch (error) {
    lapor('Koreksi akta gagal disimpan', error);
    return false;
  }
}

/**
 * Nomor urut berikutnya (001, 002, ...) untuk form tambah akta: urutan tertinggi pada tahun
 * periode aktif + 1. Server tetap menjaga keunikan (tahun, nomor urut).
 */
export function nextNomorUrut(): string {
  const terbesar = state.akta
    .filter((a) => parseInputDate(a.tanggal)?.getFullYear() === state.tahun)
    .reduce((maks, a) => Math.max(maks, parseInt(a.nomorUrut, 10) || 0), 0);
  return String(terbesar + 1).padStart(3, '0');
}

// ───────────────────────── Dokumen laporan: persetujuan & versi ─────────────────────────

/** Dokumen untuk periode yang belum pernah disentuh. */
const DOKUMEN_BARU: DokumenLaporan = {
  status: 'Draf',
  versiFinal: 0,
  catatanRevisi: '',
  snapshot: null,
};

/** Kunci penyimpanan dokumen per periode, mis. "2026-2" untuk Maret 2026. */
export const kunciPeriode = (bulan: number, tahun: number) => `${tahun}-${bulan}`;

/** Final → "1.0", "2.0". Selain itu → draf versi berikutnya: "0.1", "1.1". */
export function labelVersi(dokumen: DokumenLaporan): string {
  return dokumen.status === 'Final' ? `${dokumen.versiFinal}.0` : `${dokumen.versiFinal}.1`;
}

/**
 * Menyetujui laporan periode aktif (hanya Notaris, diperiksa server). Server yang menaikkan
 * versi dan membuat snapshot dari data akta, jadi parameter `_akta` tidak lagi dipakai.
 */
export async function setujuiLaporan(_akta: Akta[], periodeLabel: string): Promise<boolean> {
  try {
    await setujuiLaporanDb(state.bulan, state.tahun, periodeLabel);
    await muatDokumen();
    return true;
  } catch (error) {
    lapor('Laporan gagal disetujui', error);
    return false;
  }
}

/** Meminta revisi (hanya Notaris). Snapshot versi final lama tetap tersimpan di server. */
export async function mintaRevisi(catatan: string): Promise<boolean> {
  try {
    await mintaRevisiDb(state.bulan, state.tahun, catatan);
    await muatDokumen();
    return true;
  } catch (error) {
    lapor('Permintaan revisi gagal', error);
    return false;
  }
}

export function setTemplate(templateId: NamaTemplate) {
  emit({ templateId });
}

/** Status dokumen laporan pada periode yang sedang dilihat. */
export function useDokumen(): { dokumen: DokumenLaporan; versi: string } {
  const { bulan, tahun, dokumen } = useLaporanStore();

  return useMemo(() => {
    const aktif = dokumen[kunciPeriode(bulan, tahun)] ?? DOKUMEN_BARU;
    return { dokumen: aktif, versi: labelVersi(aktif) };
  }, [bulan, tahun, dokumen]);
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
    const adaAkta = aktaPeriode.length > 0;
    const aktaLengkap = aktaPeriode.every((a) => a.nomorAkta && a.pihak && a.jenis);

    const validasi: ValidasiItem[] = [
      {
        id: 'daftar-akta',
        judul: 'Daftar Akta',
        // `every` pada daftar kosong selalu true, jadi periode tanpa akta tidak boleh dianggap lengkap.
        deskripsi: !adaAkta
          ? 'Belum ada akta pada periode ini'
          : aktaLengkap
            ? 'Semua field sesuai ketentuan'
            : 'Ada akta dengan data belum lengkap',
        status: adaAkta && aktaLengkap ? 'Lengkap' : 'Tinjau',
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