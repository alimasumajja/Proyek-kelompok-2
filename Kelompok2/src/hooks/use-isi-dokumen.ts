import { useMemo } from 'react';
import { kunciPeriode, useDokumen, useLaporan, useLaporanStore } from '@/context/laporan-store';
import type { DokumenLaporan } from '@/types/laporan';
import { sarankanNomorSurat } from '@/utils/laporan-surat';
import { hitungAktaTerpisah, susunIsiDokumen, type IsiDokumen } from '@/utils/laporan-template';

interface UseIsiDokumen {
  isi: IsiDokumen;
  dokumen: DokumenLaporan;
  versi: string;
  periodeLabel: string;
  /** Jumlah akta pada dokumen yang ditampilkan. */
  jumlahAkta: number;
  /** Jumlah item validasi yang masih "Tinjau" (data terkini, bukan snapshot). */
  perluTinjau: number;
  /** Nomor surat yang dipakai: yang tersimpan, atau saran. Kosong bila belum ada sama sekali. */
  nomorSurat: string;
  /** Nomor surat ini sudah tersimpan untuk periode aktif (bukan sekadar saran). */
  nomorSuratTersimpan: boolean;
  /** Akta berjenis Waarmerking/Fidusia pada periode, padahal surat menulis NIHIL untuk keduanya. */
  aktaBertentangan: number;
}

/**
 * Isi dokumen laporan untuk pratinjau dan ekspor.
 * Laporan Final memakai snapshot yang dikunci. Selain itu memakai data Repertorium terkini.
 */
export function useIsiDokumen(): UseIsiDokumen {
  const { summary, aktaPeriode } = useLaporan();
  const { bulan, tahun, pengaturan, dokumen: semuaDokumen } = useLaporanStore();
  const { dokumen, versi } = useDokumen();

  return useMemo(() => {
    const snapshot = dokumen.status === 'Final' ? dokumen.snapshot : null;
    const akta = snapshot ? snapshot.akta : aktaPeriode;
    const periodeLabel = snapshot ? snapshot.periodeLabel : summary.periodeLabel;
    const tanggal = snapshot ? new Date(snapshot.disetujuiPada) : new Date();

    // Nomor surat: tersimpan, atau saran yang meneruskan nomor periode terbaru lainnya.
    const kunciAktif = kunciPeriode(bulan, tahun);
    const terakhir = Object.entries(semuaDokumen)
      .filter(([kunci, d]) => kunci !== kunciAktif && d.nomorSurat)
      .map(([kunci, d]) => {
        const [t, b] = kunci.split('-').map(Number);
        return { urutan: t * 12 + b, nomor: d.nomorSurat };
      })
      .sort((a, b) => b.urutan - a.urutan)[0];
    const tersimpan = (snapshot?.nomorSurat || dokumen.nomorSurat) ?? '';
    const saran = sarankanNomorSurat(terakhir?.nomor ?? null, tanggal) ?? '';
    const nomorSurat = tersimpan || saran;

    return {
      // Laporan Final memakai pengaturan saat disetujui (snapshot), agar tampilannya tidak berubah.
      isi: susunIsiDokumen({ pengaturan: snapshot?.pengaturan ?? pengaturan, periodeLabel, akta, nomorSurat, tanggal }),
      dokumen,
      versi,
      periodeLabel,
      jumlahAkta: akta.length,
      perluTinjau: summary.stats.perluTinjau,
      nomorSurat,
      nomorSuratTersimpan: !!tersimpan,
      aktaBertentangan: hitungAktaTerpisah(akta),
    };
  }, [dokumen, versi, aktaPeriode, summary, pengaturan, semuaDokumen, bulan, tahun]);
}
