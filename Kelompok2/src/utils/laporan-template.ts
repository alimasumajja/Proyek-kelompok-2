import type { Akta, KopLaporan, LebarMargin, PengaturanLaporan, UkuranFont } from '@/types/laporan';
import { tanggalPanjang, tanggalPanjangDariInput, terbilang } from '@/utils/laporan-surat';

/**
 * Format dokumen Laporan Bulanan Notaris ke Majelis Pengawas Daerah (MPDN):
 * surat pengantar (halaman 1) dan Salinan Buku Daftar Akta (halaman berikutnya).
 * Pengaturan (kop, penerima, font, margin) adalah data, bukan kode tampilan. Pratinjau di layar
 * dan berkas PDF/Word dibuat dari `IsiDokumen` yang sama, sehingga hasilnya selalu konsisten.
 */

// ───────────────────────── Isi dokumen (model tampilan) ─────────────────────────

export interface BarisPenghadap {
  teks: string;
  /** Baris "QQ. ..." (yang diwakili) tampil menjorok, tanpa tanda minus. */
  qq: boolean;
}

export interface BarisDaftarAkta {
  urut: string;
  bulanan: string;
  tanggal: string;
  sifat: string;
  penghadap: BarisPenghadap[];
}

export interface SuratPengantar {
  nomor: string;
  lampiran: string;
  perihal: string;
  /** Teks setelah "Kepada Yth.", satu elemen per baris. */
  kepada: string[];
  salam: string;
  dasar: string;
  butir: string[];
  penutup: string;
}

export interface IsiDokumen {
  kop: KopLaporan;
  ukuranFont: UkuranFont;
  margin: LebarMargin;
  /** Mis. "September 2026". */
  periodeLabel: string;
  surat: SuratPengantar;
  daftar: {
    judul: string;
    periode: string;
    baris: BarisDaftarAkta[];
  };
  lokasiTanggal: string;
  jabatanTtd: string;
  namaTtd: string;
}

/** Label kolom Salinan Buku Daftar Akta. `lebar` adalah flex relatif untuk tampilan layar. */
export const KOLOM_DAFTAR_AKTA = [
  { label: 'NO. URUT', lebar: 0.8, rata: 'tengah' as const },
  { label: 'NOMOR BULANAN', lebar: 1, rata: 'tengah' as const },
  { label: 'TANGGAL AKTA', lebar: 1.3, rata: 'tengah' as const },
  { label: 'SIFAT AKTA', lebar: 2, rata: 'tengah' as const },
  { label: 'NAMA PENGHADAP DAN ATAU YANG DIWAKILI/KUASA', lebar: 2.4 },
];

/** Satu nama per baris. Baris diawali "QQ." tampil menjorok tanpa tanda minus. */
export function pecahPenghadap(pihak: string): BarisPenghadap[] {
  return pihak
    .split(/\r?\n/)
    .map((baris) => baris.trim())
    .filter(Boolean)
    .map((baris) => (/^qq\.?\s/i.test(baris) ? { teks: baris, qq: true } : { teks: baris.replace(/^[-–]\s*/, ''), qq: false }));
}

const dua = (n: number) => String(n).padStart(2, '0');

/** "Dengan Jumlah 14 (empat belas) Akta" atau "Dengan Jumlah NIHIL". */
function jumlahTeks(jumlah: number, satuan: string): string {
  return jumlah > 0 ? `${jumlah} (${terbilang(jumlah)}) ${satuan}` : 'NIHIL';
}

interface SusunInput {
  pengaturan: PengaturanLaporan;
  /** Mis. "September 2026". */
  periodeLabel: string;
  /** Akta pada periode, terurut menurut nomor urut. */
  akta: Akta[];
  /** Nomor surat; kosong bila belum diisi. */
  nomorSurat: string;
  /** Tanggal surat dan tanda tangan. */
  tanggal: Date;
}

/** Menyusun isi dokumen dari pengaturan, data akta, nomor surat, dan tanggal. Fungsi murni. */
export function susunIsiDokumen({ pengaturan, periodeLabel, akta, nomorSurat, tanggal }: SusunInput): IsiDokumen {
  const { kop } = pengaturan;
  const periode = periodeLabel.toUpperCase();

  return {
    kop,
    ukuranFont: pengaturan.ukuranFont,
    margin: pengaturan.margin,
    periodeLabel,
    surat: {
      nomor: nomorSurat || '........',
      lampiran: '6 (enam) berkas',
      perihal: `Laporan Bulanan Notaris Periode ${periode}`,
      kepada: pengaturan.penerima.split(/\r?\n/).map((b) => b.trim()).filter(Boolean).concat('di Tempat'),
      salam: 'Dengan Hormat,',
      dasar:
        'Memenuhi ketentuan Pasal 16 ayat (1) dan Pasal 71 huruf d Undang-Undang Nomor 30 Tahun 2004 Tentang Jabatan Notaris, maka bersama surat ini saya sampaikan :',
      butir: [
        `Salinan Daftar Akta Bulan ${periode}, Dengan Jumlah ${jumlahTeks(akta.length, 'Akta')};`,
        `Salinan Daftar Surat Dibawah Tangan Yang Disahkan (Legalisasi) Bulan ${periode}, Dengan Jumlah NIHIL;`,
        `Salinan Daftar Surat Dibawah Tangan Yang Dibukukan (Waarmerking) Bulan ${periode}, Dengan Jumlah NIHIL;`,
        `Salinan Daftar Protes Bulan ${periode}, Dengan Jumlah NIHIL;`,
        `Salinan Daftar Pelaporan Wasiat Bulan ${periode}, Dengan Jumlah NIHIL;`,
        `Salinan Daftar Pelaporan Akta Jaminan Fidusia Bulan ${periode} Dengan Jumlah NIHIL.`,
      ],
      penutup: 'Demikian Laporan Bulanan ini disampaikan, atas perhatian dan kerjasamanya saya ucapkan terimakasih.',
    },
    daftar: {
      judul: 'SALINAN BUKU DAFTAR AKTA',
      periode: `PERIODE BULAN ${periode}`,
      baris: akta.map((a, i) => ({
        urut: String(parseInt(a.nomorUrut, 10) || a.nomorUrut),
        bulanan: dua(i + 1),
        tanggal: tanggalPanjangDariInput(a.tanggal),
        sifat: a.jenis.toUpperCase(),
        penghadap: pecahPenghadap(a.pihak),
      })),
    },
    lokasiTanggal: `${kop.kota}, ${tanggalPanjang(tanggal)}`,
    jabatanTtd: kop.jabatan,
    namaTtd: kop.namaTtd,
  };
}

/** Jumlah akta pada periode yang berjenis Waarmerking atau Fidusia (surat menulis NIHIL untuk keduanya). */
export function hitungAktaTerpisah(akta: Akta[]): number {
  return akta.filter((a) => /waarmerking|fidusia/i.test(a.jenis)).length;
}

// ───────────────────────── Lampiran NIHIL ─────────────────────────

export interface SelKepala {
  label: string;
  colspan?: number;
  rowspan?: number;
}

/**
 * Satu halaman lampiran berisi tabel kosong (NIHIL): Legalisasi, Waarmerking, Protes, Wasiat, Fidusia.
 * Berupa data sehingga pratinjau di layar dapat memakainya juga.
 */
export interface LampiranNihil {
  judul: string;
  periode: string;
  /** Baris header tabel; boleh bersusun dengan colspan/rowspan. */
  kepala: SelKepala[][];
  /** Sel di depan dan di belakang tulisan NIHIL pada baris isi (mis. nomor "1", tanggal lapor), bila ada. */
  awal?: string;
  akhir?: string;
  /** Jumlah kolom yang dicakup tulisan NIHIL. */
  spanNihil: number;
  teks: string;
  /** Tabel dengan banyak kolom: huruf dan bantalan sel diperkecil. */
  rapat?: boolean;
}

const sel = (label: string, opsi: { colspan?: number; rowspan?: number } = {}): SelKepala => ({ label, ...opsi });

/** Menyusun lima lampiran NIHIL yang mengikuti butir 2 sampai 6 pada surat pengantar. */
export function susunLampiranNihil(isi: IsiDokumen): LampiranNihil[] {
  const periodeUpper = isi.periodeLabel.toUpperCase();
  const periodeBulan = `PERIODE BULAN ${periodeUpper}`;
  // Tanggal lapor memakai tanggal surat, yaitu bagian setelah "Kota, " pada lokasiTanggal.
  const tanggalLapor = isi.lokasiTanggal.replace(/^[^,]*,\s*/, '');

  return [
    {
      judul: 'SALINAN BUKU SURAT DIBAWAH TANGAN YANG DISAHKAN',
      periode: periodeBulan,
      kepala: [[sel('NO. URUT'), sel('TANGGAL SURAT'), sel('SIFAT AKTA'), sel('NAMA PENGHADAP DAN ATAU YANG DIWAKILI/KUASA')]],
      spanNihil: 4,
      teks: 'N I H I L',
    },
    {
      judul: 'SALINAN BUKU DAFTAR SURAT DIBAWAH TANGAN YANG DIBUKUKAN',
      periode: periodeBulan,
      kepala: [
        [
          sel('NO. URUT'),
          sel('TANGGAL SURAT'),
          sel('TANGGAL DIDAFTARKAN'),
          sel('SIFAT SURAT'),
          sel('NAMA YANG MENANDATANGANI DAN ATAU YANG DIWAKILI/KUASA'),
        ],
      ],
      spanNihil: 5,
      teks: 'N I H I L',
    },
    {
      judul: 'SALINAN BUKU DAFTAR PROTES',
      periode: `PERIODE ${periodeUpper}`,
      kepala: [
        [
          sel('NO. URUT'),
          sel('NOMOR AKTA'),
          sel('TANGGAL'),
          sel('YANG DITAGIH'),
          sel('YANG MENAGIH'),
          sel('TANGGAL WESEL/CHEQUE'),
          sel('TANGGAL JATUH WAKTU WESEL/CHEQUE'),
        ],
      ],
      spanNihil: 7,
      teks: 'N I H I L',
    },
    {
      judul: 'LAPORAN WASIAT',
      periode: periodeBulan,
      kepala: [
        [sel('NO', { rowspan: 2 }), sel('Pemberi Wasiat', { colspan: 5 }), sel('Akta Wasiat', { colspan: 5 }), sel('Tanggal Lapor', { rowspan: 2 })],
        [
          sel('Nama Lengkap Pemberi Wasiat'),
          sel('Dahulu Bernama'),
          sel('Tempat Lahir'),
          sel('Tanggal Bulan dan Tahun Lahir'),
          sel('Alamat Pemberi Wasiat'),
          sel('Nomor Akta'),
          sel('Tanggal Bulan dan Tahun Akta'),
          sel('No Rep.'),
          sel('Jenis Akta'),
        ],
      ],
      awal: '1',
      akhir: tanggalLapor,
      spanNihil: 10,
      teks: 'NIHIL',
      rapat: true,
    },
    {
      judul: 'LAPORAN AKTA JAMINAN FIDUSIA',
      periode: periodeBulan,
      kepala: [
        [sel('NO', { rowspan: 2 }), sel('NOMOR AKTA', { rowspan: 2 }), sel('TANGGAL AKTA', { rowspan: 2 }), sel('PARA PIHAK', { colspan: 2 }), sel('NO. SERTIFIKAT JAMINAN FIDUSIA', { rowspan: 2 })],
        [sel('NAMA PEMBERI FIDUSIA'), sel('NAMA PENERIMA FIDUSIA & TEMPAT KEDUDUKAN PROVINSI')],
      ],
      spanNihil: 6,
      teks: 'NIHIL',
    },
  ];
}

// ───────────────────────── HTML untuk PDF dan Word ─────────────────────────

type ModeRender = 'pdf' | 'word';

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

const UKURAN_PT: Record<UkuranFont, { dasar: number; tabel: number; judul: number }> = {
  Kecil: { dasar: 10, tabel: 9, judul: 11 },
  Sedang: { dasar: 12, tabel: 11, judul: 12 },
  Besar: { dasar: 13, tabel: 12, judul: 13 },
};
const MARGIN_MM: Record<LebarMargin, string> = {
  Sempit: '14mm 12mm',
  Normal: '22mm 18mm',
  Lebar: '28mm 24mm',
};

/**
 * CSS bersama PDF dan Word.
 * Word memberi spasi bawaan pada <div>/<p> dan mengabaikan margin pada tabel, karena itu semua baris
 * teks memakai <p> dengan margin 0 (lengkap dengan properti mso-), dan jarak dibuat dengan <p class="jeda">.
 */
function buatCss(isi: IsiDokumen): string {
  const u = UKURAN_PT[isi.ukuranFont];
  const nol = 'margin: 0; mso-margin-top-alt: 0cm; mso-margin-bottom-alt: 0cm;';
  return `
  @page { margin: ${MARGIN_MM[isi.margin]}; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: ${u.dasar}pt; color: #111; }

  /* Teks umum */
  p { margin: 0 0 8px; text-align: justify; }
  ol { margin: 0; padding-left: 28px; }
  ol li { margin-bottom: 4px; text-align: justify; }
  .halaman-baru { page-break-before: always; }

  /* Baris tanpa spasi bawaan */
  p.nama, p.baris, p.judul, p.t, p.jeda { ${nol} text-align: left; line-height: 1.25; }
  p.jeda { font-size: 6pt; line-height: 10pt; mso-line-height-rule: exactly; }
  p.jeda-ttd { ${nol} font-size: 6pt; line-height: 22pt; mso-line-height-rule: exactly; }
  /* Ruang kosong untuk tanda tangan dan cap: tinggi tetap agar Word tidak memadatkannya. */
  table.ttd p.ruang-ttd { ${nol} font-size: 6pt; line-height: 68pt; mso-line-height-rule: exactly; }

  /* Kop (tabel satu sel agar garis bawah selalu tampil di Word) */
  table.kop { width: 100%; border-collapse: collapse; }
  p.nama { font-size: ${u.dasar + 2}pt; font-weight: bold; }
  p.baris { font-size: ${u.dasar - 2}pt; }

  /* Surat */
  table.meta { border-collapse: collapse; width: 100%; table-layout: fixed; }
  table.meta td { border: none; padding: 2px 4px; vertical-align: top; font-size: ${u.dasar}pt; }
  table.meta td p.t { font-size: ${u.dasar}pt; }

  /* Judul daftar akta */
  p.judul { text-align: center; font-weight: bold; font-size: ${u.judul}pt; }

  /* Tabel daftar akta */
  table.daftar { width: 100%; border-collapse: collapse; }
  table.daftar th, table.daftar td { border: 1px solid #111; padding: 5px 6px; font-size: ${u.tabel}pt; vertical-align: middle; }
  table.daftar th { font-weight: bold; text-align: center; }
  table.daftar td.tengah { text-align: center; }
  table.daftar td.kiri { text-align: left; vertical-align: middle; }
  table.daftar td.polos { border: none; padding: 0; }
  table.daftar tr { page-break-inside: avoid; }
  table.daftar td p.t { font-size: ${u.tabel}pt; }
  table.daftar td p.qq { margin-left: 14px; }
  thead { display: table-header-group; }
  .nihil { text-align: center; font-weight: bold; letter-spacing: 4px; }
  table.daftar.rapat th, table.daftar.rapat td { padding: 3px 3px; font-size: ${u.tabel - 1.5}pt; }
  table.daftar td.nihil { padding: 10px 6px; }

  /* Tanda tangan */
  table.ttd { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
  table.ttd td { border: none; padding: 0; vertical-align: top; font-size: ${u.dasar}pt; }
  table.ttd p.t { font-size: ${u.dasar}pt; }
`;
}

function htmlKop(kop: KopLaporan): string {
  const jabatan = kop.wilayah ? `${kop.jabatan} – ${kop.wilayah}` : kop.jabatan;
  // Gaya garis bawah ditulis inline agar menang atas aturan "table.daftar td" saat kop berada di <thead> PDF.
  return `<table class="kop"><tr>
      <td style="border:none;border-bottom:2px solid #111;padding:0 0 6px 0;text-align:left">
        <p class="nama">${escapeHtml(kop.namaNotaris)}</p>
        <p class="baris">${escapeHtml(jabatan)}</p>
        <p class="baris">${escapeHtml(kop.alamat)}</p>
        ${kop.telepon ? `<p class="baris">${escapeHtml(kop.telepon)}</p>` : ''}
      </td>
    </tr></table>
    <p class="jeda">&nbsp;</p>`;
}

function htmlTtd(isi: IsiDokumen): string {
  return `<p class="jeda-ttd">&nbsp;</p>
    <table class="ttd"><tr>
      <td style="width:52%">&nbsp;</td>
      <td>
        <p class="t">${escapeHtml(isi.lokasiTanggal)}</p>
        <p class="t">${escapeHtml(isi.jabatanTtd)}</p>
        <p class="ruang-ttd">&nbsp;</p>
        <p class="t">${escapeHtml(isi.namaTtd)}</p>
      </td>
    </tr></table>`;
}

function htmlSurat(isi: IsiDokumen): string {
  const s = isi.surat;
  return `${htmlKop(isi.kop)}
    <table class="meta">
      <tr>
        <td style="width:13%"><p class="t">Nomor</p></td>
        <td style="width:2%"><p class="t">:</p></td>
        <td style="width:40%"><p class="t">${escapeHtml(s.nomor)}</p></td>
        <td rowspan="3" style="width:45%"><p class="t">Kepada Yth.</p>${s.kepada
          .map((k) => `<p class="t">${escapeHtml(k)}</p>`)
          .join('')}</td>
      </tr>
      <tr>
        <td><p class="t">Lampiran</p></td>
        <td><p class="t">:</p></td>
        <td><p class="t">${escapeHtml(s.lampiran)}</p></td>
      </tr>
      <tr>
        <td><p class="t">Perihal</p></td>
        <td><p class="t">:</p></td>
        <td><p class="t">${escapeHtml(s.perihal)}</p></td>
      </tr>
    </table>
    <p class="jeda">&nbsp;</p>
    <p>${escapeHtml(s.salam)}</p>
    <p>${escapeHtml(s.dasar)}</p>
    <ol>${s.butir.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ol>
    <p class="jeda">&nbsp;</p>
    <p>${escapeHtml(s.penutup)}</p>
    ${htmlTtd(isi)}`;
}

/**
 * Daftar akta.
 * - PDF: kop, judul, dan header kolom berada di <thead> sehingga berulang di setiap halaman.
 * - Word: kop dan judul ditaruh di luar tabel (Word menambah spasi dan membuang <br> di dalam sel),
 *   hanya header kolom yang berulang.
 */
function htmlDaftar(isi: IsiDokumen, mode: ModeRender): string {
  const { baris } = isi.daftar;
  const jumlahKolom = KOLOM_DAFTAR_AKTA.length;
  const kepala = KOLOM_DAFTAR_AKTA.map((k) => `<th>${escapeHtml(k.label)}</th>`).join('');
  const isiBaris = baris
    .map(
      (b) => `<tr>
        <td class="tengah">${escapeHtml(b.urut)}</td>
        <td class="tengah">${escapeHtml(b.bulanan)}</td>
        <td class="tengah">${escapeHtml(b.tanggal)}</td>
        <td class="tengah">${escapeHtml(b.sifat)}</td>
        <td class="kiri">${b.penghadap
          .map((p) => `<p class="t${p.qq ? ' qq' : ''}">${p.qq ? '' : '- '}${escapeHtml(p.teks)}</p>`)
          .join('')}</td>
      </tr>`
    )
    .join('');
  const kosong = `<tr><td colspan="${jumlahKolom}" class="nihil">N I H I L</td></tr>`;

  const kopJudul = `${htmlKop(isi.kop)}
    <p class="judul">${escapeHtml(isi.daftar.judul)}</p>
    <p class="judul">${escapeHtml(isi.daftar.periode)}</p>
    <p class="jeda">&nbsp;</p>`;

  const thead =
    mode === 'pdf'
      ? `<thead>
          <tr><td colspan="${jumlahKolom}" class="polos">${kopJudul}</td></tr>
          <tr>${kepala}</tr>
        </thead>`
      : `<thead><tr>${kepala}</tr></thead>`;

  return `${mode === 'word' ? kopJudul : ''}
    <table class="daftar">${thead}<tbody>${isiBaris || kosong}</tbody></table>
    ${htmlTtd(isi)}`;
}

/** Satu halaman lampiran NIHIL: kop, judul, tabel kosong, dan tanda tangan. */
function htmlLampiranNihil(l: LampiranNihil, isi: IsiDokumen): string {
  const atribut = (s: SelKepala) =>
    `${s.colspan ? ` colspan="${s.colspan}"` : ''}${s.rowspan ? ` rowspan="${s.rowspan}"` : ''}`;
  const kepala = l.kepala
    .map((baris) => `<tr>${baris.map((s) => `<th${atribut(s)}>${escapeHtml(s.label)}</th>`).join('')}</tr>`)
    .join('');
  // Tulisan "NIHIL" tanpa spasi tidak diberi jarak antarhuruf.
  const gaya = l.teks.includes(' ') ? '' : ' style="letter-spacing:0"';
  const barisNihil = `<tr>${l.awal ? `<td class="tengah">${escapeHtml(l.awal)}</td>` : ''}<td colspan="${l.spanNihil}" class="nihil"${gaya}>${escapeHtml(l.teks)}</td>${l.akhir ? `<td class="tengah">${escapeHtml(l.akhir)}</td>` : ''}</tr>`;

  return `${htmlKop(isi.kop)}
    <p class="judul">${escapeHtml(l.judul)}</p>
    <p class="judul">${escapeHtml(l.periode)}</p>
    <p class="jeda">&nbsp;</p>
    <table class="daftar${l.rapat ? ' rapat' : ''}"><thead>${kepala}</thead><tbody>${barisNihil}</tbody></table>
    ${htmlTtd(isi)}`;
}

/**
 * Membungkus satu halaman. Word mengabaikan page-break-before pada <div>, dan membuang <br clear="all"> yang
 * langsung diikuti tabel; paragraf kecil yang membawa page-break-before selalu dihormati.
 */
function halamanBaru(mode: ModeRender, konten: string): string {
  if (mode === 'word') {
    const pemisah = `<p style="page-break-before:always;margin:0;font-size:1pt;line-height:1pt;mso-line-height-rule:exactly">&nbsp;</p>`;
    return `${pemisah}<div>${konten}</div>`;
  }
  return `<div class="halaman-baru">${konten}</div>`;
}

function isiBody(isi: IsiDokumen, mode: ModeRender): string {
  const lampiran = susunLampiranNihil(isi)
    .map((l) => halamanBaru(mode, htmlLampiranNihil(l, isi)))
    .join('');
  return `<div>${htmlSurat(isi)}</div>${halamanBaru(mode, htmlDaftar(isi, mode))}${lampiran}`;
}

/** HTML lengkap untuk dicetak menjadi PDF. */
export function renderHtmlPdf(isi: IsiDokumen): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${buatCss(isi)}</style></head><body>${isiBody(isi, 'pdf')}</body></html>`;
}

/** HTML yang dapat dibuka Microsoft Word (disimpan dengan ekstensi .doc). */
export function renderHtmlWord(isi: IsiDokumen): string {
  const [v, h] = MARGIN_MM[isi.margin].split(' ');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><title>${escapeHtml(isi.surat.perihal)}</title>
    <style>${buatCss(isi)}
      @page WordSection1 { size: 21cm 29.7cm; margin: ${v} ${h} ${v} ${h}; }
      div.WordSection1 { page: WordSection1; }
    </style></head><body><div class="WordSection1">${isiBody(isi, 'word')}</div></body></html>`;
}