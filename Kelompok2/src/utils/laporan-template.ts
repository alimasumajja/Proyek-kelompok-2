import { BULAN, formatTanggalAkta } from '@/context/laporan-store';
import type { Akta, NamaTemplate } from '@/types/laporan';

/**
 * Template format dokumen Laporan Bulanan Notaris.
 * Template = data (kolom tabel + kop), bukan kode tampilan. Pratinjau di layar dan berkas
 * PDF/Word dibuat dari `IsiDokumen` yang sama, sehingga hasilnya selalu konsisten.
 */

// ───────────────────────── Definisi template ─────────────────────────

export interface KopLaporan {
  namaKantor: string;
  alamat: string;
  namaNotaris: string;
  kota: string;
}

/** Kop sementara (placeholder desain). Nanti dapat diisi dari data kantor di Profil. */
export const KOP_DEFAULT: KopLaporan = {
  namaKantor: 'KANTOR NOTARIS',
  alamat: 'Alamat kantor notaris',
  namaNotaris: 'Nama Notaris, S.H., M.Kn.',
  kota: 'Jakarta',
};

interface KolomTemplate {
  label: string;
  /** Mengambil teks sel dari satu akta. `no` dimulai dari 1. */
  nilai: (akta: Akta, no: number) => string;
  /** Lebar relatif kolom (flex). */
  lebar: number;
  rata?: 'tengah';
}

interface DefinisiTemplate {
  deskripsi: string;
  kolom: KolomTemplate[];
}

const KOLOM_NO: KolomTemplate = { label: 'No', nilai: (_a, no) => String(no), lebar: 0.6, rata: 'tengah' };
const KOLOM_NOMOR: KolomTemplate = { label: 'Nomor Akta', nilai: (a) => a.nomorAkta, lebar: 1.3 };
const KOLOM_JENIS: KolomTemplate = { label: 'Jenis Akta', nilai: (a) => a.jenis, lebar: 2 };

export const TEMPLATE_LAPORAN: Record<NamaTemplate, DefinisiTemplate> = {
  Ringkas: {
    deskripsi: 'Tiga kolom: nomor, nomor akta, jenis akta.',
    kolom: [KOLOM_NO, KOLOM_NOMOR, KOLOM_JENIS],
  },
  Lengkap: {
    deskripsi: 'Enam kolom: ditambah tanggal, pihak terkait, dan status.',
    kolom: [
      KOLOM_NO,
      KOLOM_NOMOR,
      { label: 'Tanggal', nilai: (a) => formatTanggalAkta(a.tanggal), lebar: 1.4 },
      KOLOM_JENIS,
      { label: 'Pihak Terkait', nilai: (a) => a.pihak, lebar: 2.2 },
      { label: 'Status', nilai: (a) => a.status, lebar: 0.9 },
    ],
  },
};

export const NAMA_TEMPLATE = Object.keys(TEMPLATE_LAPORAN) as NamaTemplate[];

// ───────────────────────── Isi dokumen (model tampilan) ─────────────────────────

export interface IsiDokumen {
  kop: KopLaporan;
  judul: string;
  periodeLabel: string;
  kolom: { label: string; lebar: number; rata?: 'tengah' }[];
  baris: string[][];
  lokasiTanggal: string;
  penandatangan: string;
}

interface SusunInput {
  template: NamaTemplate;
  periodeLabel: string;
  akta: Akta[];
  /** Tanggal pada bagian tanda tangan. */
  tanggal: Date;
  kop?: KopLaporan;
}

/** Menyusun isi dokumen dari template, data akta, dan tanggal. Fungsi murni. */
export function susunIsiDokumen({
  template,
  periodeLabel,
  akta,
  tanggal,
  kop = KOP_DEFAULT,
}: SusunInput): IsiDokumen {
  const { kolom } = TEMPLATE_LAPORAN[template];
  return {
    kop,
    judul: 'LAPORAN BULANAN NOTARIS',
    periodeLabel,
    kolom: kolom.map(({ label, lebar, rata }) => ({ label, lebar, rata })),
    baris: akta.map((a, i) => kolom.map((k) => k.nilai(a, i + 1))),
    lokasiTanggal: `${kop.kota}, ${tanggal.getDate()} ${BULAN[tanggal.getMonth()]} ${tanggal.getFullYear()}`,
    penandatangan: kop.namaNotaris,
  };
}

// ───────────────────────── HTML untuk PDF dan Word ─────────────────────────

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Mengamankan teks dari pengguna sebelum dimasukkan ke HTML. */
export function escapeHtml(teks: string): string {
  return teks.replace(/[&<>"']/g, (c) => ESCAPE[c] ?? c);
}

const CSS = `
  @page { margin: 24mm 18mm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #111; }
  .kop { border-bottom: 3px solid #1f4d3a; padding-bottom: 8px; margin-bottom: 20px; }
  .kop .kantor { font-size: 13pt; font-weight: bold; letter-spacing: 1px; }
  .kop .alamat { font-size: 10pt; color: #444; }
  .kop .notaris { font-size: 10pt; color: #444; }
  h1 { text-align: center; font-size: 15pt; margin: 0; }
  .periode { text-align: center; font-size: 11pt; margin: 4px 0 18px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #555; padding: 6px 8px; font-size: 11pt; text-align: left; }
  th { background: #eef3ef; }
  .tengah { text-align: center; }
  .ttd { margin-top: 36px; text-align: right; }
  .ttd .ruang { height: 64px; }
  .ttd .nama { font-weight: bold; text-decoration: underline; }
`;

function isiBody(isi: IsiDokumen): string {
  const kepala = isi.kolom
    .map((k) => `<th${k.rata ? ' class="tengah"' : ''}>${escapeHtml(k.label)}</th>`)
    .join('');
  const baris = isi.baris
    .map(
      (sel) =>
        `<tr>${sel
          .map((teks, i) => `<td${isi.kolom[i]?.rata ? ' class="tengah"' : ''}>${escapeHtml(teks)}</td>`)
          .join('')}</tr>`
    )
    .join('');
  const kosong = `<tr><td colspan="${isi.kolom.length}" class="tengah">Tidak ada akta pada periode ini.</td></tr>`;

  return `
    <div class="kop">
      <div class="kantor">${escapeHtml(isi.kop.namaKantor)}</div>
      <div class="alamat">${escapeHtml(isi.kop.alamat)}</div>
      <div class="notaris">${escapeHtml(isi.kop.namaNotaris)}</div>
    </div>
    <h1>${escapeHtml(isi.judul)}</h1>
    <div class="periode">Periode ${escapeHtml(isi.periodeLabel)}</div>
    <table>
      <thead><tr>${kepala}</tr></thead>
      <tbody>${baris || kosong}</tbody>
    </table>
    <div class="ttd">
      <div>${escapeHtml(isi.lokasiTanggal)}</div>
      <div class="ruang"></div>
      <div class="nama">${escapeHtml(isi.penandatangan)}</div>
    </div>`;
}

/** HTML lengkap untuk dicetak menjadi PDF. */
export function renderHtmlPdf(isi: IsiDokumen): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${CSS}</style></head><body>${isiBody(isi)}</body></html>`;
}

/** HTML yang dapat dibuka Microsoft Word (disimpan dengan ekstensi .doc). */
export function renderHtmlWord(isi: IsiDokumen): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><title>${escapeHtml(isi.judul)}</title>
    <style>${CSS}</style></head><body>${isiBody(isi)}</body></html>`;
}