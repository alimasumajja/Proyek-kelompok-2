import { useMemo } from 'react';
import { useDokumen, useLaporan, useLaporanStore } from '@/context/laporan-store';
import type { DokumenLaporan } from '@/types/laporan';
import { susunIsiDokumen, type IsiDokumen } from '@/utils/laporan-template';

interface UseIsiDokumen {
  isi: IsiDokumen;
  dokumen: DokumenLaporan;
  versi: string;
  periodeLabel: string;
  /** Jumlah akta pada dokumen yang ditampilkan. */
  jumlahAkta: number;
  /** Jumlah item validasi yang masih "Tinjau" (data terkini, bukan snapshot). */
  perluTinjau: number;
}

/**
 * Isi dokumen laporan untuk pratinjau dan ekspor.
 * Laporan Final memakai snapshot yang dikunci. Selain itu memakai data Repertorium terkini.
 */
export function useIsiDokumen(): UseIsiDokumen {
  const { summary, aktaPeriode } = useLaporan();
  const { templateId } = useLaporanStore();
  const { dokumen, versi } = useDokumen();

  return useMemo(() => {
    const snapshot = dokumen.status === 'Final' ? dokumen.snapshot : null;
    const akta = snapshot ? snapshot.akta : aktaPeriode;
    const periodeLabel = snapshot ? snapshot.periodeLabel : summary.periodeLabel;
    const tanggal = snapshot ? new Date(snapshot.disetujuiPada) : new Date();

    return {
      isi: susunIsiDokumen({ template: templateId, periodeLabel, akta, tanggal }),
      dokumen,
      versi,
      periodeLabel,
      jumlahAkta: akta.length,
      perluTinjau: summary.stats.perluTinjau,
    };
  }, [dokumen, versi, aktaPeriode, summary, templateId]);
}