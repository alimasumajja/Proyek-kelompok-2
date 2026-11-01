import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { renderHtmlPdf, renderHtmlWord, type IsiDokumen } from '@/utils/laporan-template';

/** Hasil ekspor. `pesan` hanya ada saat gagal, siap ditampilkan ke pengguna. */
export type HasilEkspor = { ok: true } | { ok: false; pesan: string };

const GAGAL_BAGIKAN: HasilEkspor = {
  ok: false,
  pesan: 'Berbagi file tidak tersedia di perangkat ini.',
};

/** Nama berkas aman, mis. "Laporan-Maret-2026-v1.0". */
function namaBerkas(isi: IsiDokumen, versi: string): string {
  return `Laporan-${isi.periodeLabel.replace(/\s+/g, '-')}-v${versi}`;
}

/** Membuat PDF dari dokumen lalu membuka menu bagikan. Di web, membuka dialog cetak browser. */
export async function eksporPdf(isi: IsiDokumen): Promise<HasilEkspor> {
  try {
    const { uri } = await Print.printToFileAsync({ html: renderHtmlPdf(isi) });
    if (Platform.OS === 'web') return { ok: true };
    if (!(await Sharing.isAvailableAsync())) return GAGAL_BAGIKAN;
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Laporan ${isi.periodeLabel}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Gagal membuat PDF. Coba lagi.' };
  }
}

/**
 * Membuat berkas Word (.doc berisi HTML yang dibuka Word) lalu membuka menu bagikan.
 * Bukan format .docx asli, tetapi dapat dibuka dan disunting di Microsoft Word.
 */
export async function eksporWord(isi: IsiDokumen, versi: string): Promise<HasilEkspor> {
  if (Platform.OS === 'web') {
    return { ok: false, pesan: 'Ekspor Word tersedia di aplikasi Android dan iOS.' };
  }
  try {
    const berkas = new File(Paths.cache, `${namaBerkas(isi, versi)}-${Date.now()}.doc`);
    berkas.create();
    berkas.write(renderHtmlWord(isi));
    if (!(await Sharing.isAvailableAsync())) return GAGAL_BAGIKAN;
    await Sharing.shareAsync(berkas.uri, {
      mimeType: 'application/msword',
      dialogTitle: `Laporan ${isi.periodeLabel}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Gagal membuat berkas Word. Coba lagi.' };
  }
}