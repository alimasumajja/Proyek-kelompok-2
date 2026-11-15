import { supabase } from '@/lib/supabase';
import type { Akta, AktaInput, DokumenLaporan, PengaturanLaporan, SifatAkta, StatusAkta } from '@/types/laporan';
import { normalisasiPengaturan, PENGATURAN_DEFAULT } from '@/utils/laporan-pengaturan';

/**
 * Lapisan data Laporan ⇄ Supabase.
 * Hanya berisi fungsi akses database + pemetaan bentuk data. Tidak menyimpan state
 * (state tetap di `context/laporan-store.ts`). Bulan di aplikasi 0–11, di database 1–12.
 */

// ───────────────────────── Pemetaan tanggal & baris ─────────────────────────

/** "12-03-2026" → "2026-03-12" (format kolom `date` Postgres). */
export function tanggalKeDb(tanggal: string): string {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(tanggal.trim());
  if (!m) throw new Error(`Format tanggal tidak valid: ${tanggal}`);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** "2026-03-12" → "12-03-2026" (format input aplikasi). */
export function tanggalDariDb(tanggal: string): string {
  const [y, m, d] = tanggal.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
}

const padUrut = (n: number) => String(n).padStart(3, '0');

/** Baris tabel `akta` (juga bentuk akta di dalam snapshot jsonb). */
interface AktaRow {
  id: string;
  nomor_urut: number;
  nomor_akta: string;
  tanggal: string;
  jenis: string;
  pihak: string;
  sifat: SifatAkta;
  status: StatusAkta;
  catatan: string;
}

export function rowKeAkta(r: AktaRow): Akta {
  return {
    id: r.id,
    nomorUrut: padUrut(r.nomor_urut),
    nomorAkta: r.nomor_akta,
    tanggal: tanggalDariDb(r.tanggal),
    jenis: r.jenis,
    pihak: r.pihak,
    sifat: r.sifat,
    status: r.status,
    catatan: r.catatan ?? '',
  };
}

function aktaKeRow(input: AktaInput) {
  return {
    nomor_urut: parseInt(input.nomorUrut, 10),
    nomor_akta: input.nomorAkta,
    tanggal: tanggalKeDb(input.tanggal),
    jenis: input.jenis,
    pihak: input.pihak,
    sifat: input.sifat,
    status: input.status,
    catatan: input.catatan,
  };
}

function cek<T>(hasil: { data: T; error: { message: string } | null }): T {
  if (hasil.error) throw new Error(hasil.error.message);
  return hasil.data;
}

// ───────────────────────── Akta (Repertorium) ─────────────────────────

export async function ambilSemuaAkta(): Promise<Akta[]> {
  const rows = cek(
    await supabase.from('akta').select('*').order('tanggal').order('nomor_urut'),
  ) as AktaRow[];
  return rows.map(rowKeAkta);
}

export async function tambahAktaDb(input: AktaInput): Promise<Akta> {
  const row = cek(await supabase.from('akta').insert(aktaKeRow(input)).select().single());
  return rowKeAkta(row as AktaRow);
}

export async function ubahAktaDb(id: string, input: AktaInput): Promise<Akta> {
  const row = cek(await supabase.from('akta').update(aktaKeRow(input)).eq('id', id).select().single());
  return rowKeAkta(row as AktaRow);
}

/** Nomor urut berikutnya untuk satu tahun, dihitung server. Contoh: "004". */
export async function nomorUrutBerikutnya(tahun: number): Promise<string> {
  const n = cek(await supabase.rpc('next_nomor_urut', { p_tahun: tahun })) as number;
  return padUrut(n);
}

// ───────────────────────── Konfirmasi kategori kosong ─────────────────────────

export async function ambilKonfirmasi(bulan: number, tahun: number): Promise<string[]> {
  const rows = cek(
    await supabase
      .from('konfirmasi_kategori')
      .select('kategori')
      .eq('tahun', tahun)
      .eq('bulan', bulan + 1),
  ) as { kategori: string }[];
  return rows.map((r) => r.kategori);
}

export async function simpanKonfirmasi(bulan: number, tahun: number, kategori: string[]): Promise<void> {
  if (kategori.length === 0) return;
  cek(
    await supabase
      .from('konfirmasi_kategori')
      .upsert(
        kategori.map((k) => ({ tahun, bulan: bulan + 1, kategori: k })),
        { onConflict: 'tahun,bulan,kategori', ignoreDuplicates: true },
      ),
  );
}

// ───────────────────────── Dokumen laporan, persetujuan & revisi ─────────────────────────

/** Kunci periode yang sama dengan `kunciPeriode()` di store: "2026-2" = Maret 2026. */
const kunci = (bulanDb: number, tahun: number) => `${tahun}-${bulanDb - 1}`;

/** Semua dokumen laporan (beserta snapshot versi final terbaru), siap dipakai store. */
export async function ambilDokumen(): Promise<Record<string, DokumenLaporan>> {
  const periode = cek(
    await supabase.from('laporan_periode').select('id, tahun, bulan, status, versi_final, catatan_revisi, nomor_surat'),
  ) as {
    id: string; tahun: number; bulan: number;
    status: DokumenLaporan['status']; versi_final: number; catatan_revisi: string; nomor_surat: string | null;
  }[];

  const snapshots = cek(
    await supabase
      .from('laporan_snapshot')
      .select('periode_id, versi, periode_label, disetujui_pada, akta, pengaturan, nomor_surat')
      .order('versi', { ascending: false }),
  ) as {
    periode_id: string; versi: number; periode_label: string; disetujui_pada: string; akta: AktaRow[];
    pengaturan: unknown; nomor_surat: string | null;
  }[];

  const hasil: Record<string, DokumenLaporan> = {};
  for (const p of periode) {
    // Urutan versi menurun → snapshot pertama yang cocok adalah yang terbaru.
    const s = snapshots.find((x) => x.periode_id === p.id);
    hasil[kunci(p.bulan, p.tahun)] = {
      status: p.status,
      versiFinal: p.versi_final,
      catatanRevisi: p.catatan_revisi ?? '',
      nomorSurat: p.nomor_surat ?? '',
      snapshot: s
        ? {
            periodeLabel: s.periode_label,
            disetujuiPada: s.disetujui_pada,
            akta: s.akta.map(rowKeAkta),
            nomorSurat: s.nomor_surat ?? undefined,
            pengaturan: s.pengaturan ? normalisasiPengaturan(s.pengaturan) : undefined,
          }
        : null,
    };
  }
  return hasil;
}

/** Menyimpan nomor surat pengantar untuk satu periode (ditolak server bila periode sudah Final). */
export async function simpanNomorSuratDb(bulan: number, tahun: number, nomor: string): Promise<void> {
  cek(await supabase.rpc('simpan_nomor_surat', { p_tahun: tahun, p_bulan: bulan + 1, p_nomor: nomor }));
}

/** Hanya Notaris. Snapshot dibuat di server dari data akta periode tersebut. */
export async function setujuiLaporanDb(bulan: number, tahun: number, periodeLabel: string): Promise<void> {
  cek(await supabase.rpc('setujui_laporan', { p_tahun: tahun, p_bulan: bulan + 1, p_label: periodeLabel }));
}

/** Hanya Notaris. */
export async function mintaRevisiDb(bulan: number, tahun: number, catatan: string): Promise<void> {
  cek(await supabase.rpc('minta_revisi', { p_tahun: tahun, p_bulan: bulan + 1, p_catatan: catatan }));
}
// ───────────────────────── Pengaturan tampilan dokumen (satu untuk seluruh kantor) ─────────────────────────

interface PengaturanRow {
  kop: unknown;
  penerima: string;
  ukuran_font: string;
  margin: string;
}

/** Pengaturan kantor. Bila tabel belum ada atau kosong, memakai nilai bawaan agar layar tetap jalan. */
export async function ambilPengaturan(): Promise<PengaturanLaporan> {
  const { data, error } = await supabase
    .from('laporan_pengaturan')
    .select('kop, penerima, ukuran_font, margin')
    .eq('id', 'kantor')
    .maybeSingle();
  if (error) {
    console.warn(`[laporan] pengaturan memakai nilai bawaan: ${error.message}`);
    return PENGATURAN_DEFAULT;
  }
  if (!data) return PENGATURAN_DEFAULT;
  const r = data as PengaturanRow;
  return normalisasiPengaturan({ kop: r.kop, penerima: r.penerima, ukuranFont: r.ukuran_font, margin: r.margin });
}

export async function simpanPengaturanDb(p: PengaturanLaporan): Promise<void> {
  cek(
    await supabase.from('laporan_pengaturan').upsert({
      id: 'kantor',
      kop: p.kop,
      penerima: p.penerima,
      ukuran_font: p.ukuranFont,
      margin: p.margin,
    }),
  );
}
