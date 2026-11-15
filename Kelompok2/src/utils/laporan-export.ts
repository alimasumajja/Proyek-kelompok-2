import { Directory, File, Paths } from 'expo-file-system';
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

/** Penanda versi kode ekspor. Ubah bila ingin memastikan kode terbaru yang berjalan. */
const PENANDA = 'V4';

/** Nama berkas aman, mis. "Laporan-Maret-2026-v1.0". */
function namaBerkas(isi: IsiDokumen, versi: string): string {
  return `Laporan-${isi.periodeLabel.replace(/\s+/g, '-')}-v${versi}`;
}

function teksError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const ABJAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Mengubah teks base64 menjadi byte, tanpa bergantung pada atob/Buffer. */
function dariBase64(base64: string): Uint8Array {
  const bersih = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const panjang = Math.floor((bersih.length * 3) / 4);
  const keluar = new Uint8Array(panjang);
  let p = 0;
  for (let i = 0; i < bersih.length; i += 4) {
    const n = [0, 1, 2, 3].map((k) => (i + k < bersih.length ? ABJAD.indexOf(bersih[i + k]) : 0));
    const tiga = (n[0] << 18) | (n[1] << 12) | (n[2] << 6) | n[3];
    if (p < panjang) keluar[p++] = (tiga >> 16) & 255;
    if (p < panjang) keluar[p++] = (tiga >> 8) & 255;
    if (p < panjang) keluar[p++] = tiga & 255;
  }
  return keluar;
}

/**
 * Membuat PDF dari dokumen. Android: disimpan ke folder pilihan pengguna; bila dibatalkan atau gagal,
 * dibuka lewat menu bagikan. iOS: menu bagikan ("Save to Files"). Web: dialog cetak browser.
 */
export async function eksporPdf(isi: IsiDokumen, versi?: string): Promise<HasilEkspor> {
  try {
    console.log(`>>> eksporPdf ${PENANDA} dipanggil`);
    // base64: true mengembalikan isi PDF langsung, sehingga berkas hasil expo-print tidak perlu dibaca/disalin
    // (di Expo Go folder itu tidak boleh dibaca modul file-system). Ukuran A4 dalam poin (595 x 842).
    const hasil = await Print.printToFileAsync({
      html: renderHtmlPdf(isi),
      width: 595,
      height: 842,
      base64: true,
    });
    if (Platform.OS === 'web') return { ok: true };
    if (!hasil.base64) return { ok: false, pesan: 'Gagal membuat PDF: isi berkas kosong.' };

    const bytes = dariBase64(hasil.base64);
    const nama = versi ? namaBerkas(isi, versi) : `Laporan-${isi.periodeLabel.replace(/\s+/g, '-')}`;

    // Android: simpan langsung ke folder pilihan pengguna.
    if (Platform.OS === 'android') {
      try {
        const folder = await Directory.pickDirectoryAsync();
        const tujuan = folder.createFile(`${nama}.pdf`, 'application/pdf');
        tujuan.write(bytes);
        return { ok: true };
      } catch (e) {
        console.log('Simpan ke folder dilewati:', e);
      }
    }

    // Menu bagikan: tulis dulu ke cache aplikasi (folder yang boleh ditulis), lalu bagikan.
    const berkas = new File(Paths.cache, `${nama}-${Date.now()}.pdf`);
    berkas.create();
    berkas.write(bytes);
    if (!(await Sharing.isAvailableAsync())) return GAGAL_BAGIKAN;
    await Sharing.shareAsync(berkas.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Laporan ${isi.periodeLabel}`,
    });
    return { ok: true };
  } catch (e) {
    console.warn('Ekspor PDF gagal:', e);
    return { ok: false, pesan: `Gagal membuat PDF: ${teksError(e)}` };
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
    console.log(`>>> eksporWord ${PENANDA} dipanggil`);
    const html = renderHtmlWord(isi);

    const berkas = new File(Paths.cache, `${namaBerkas(isi, versi)}-${Date.now()}.doc`);
    berkas.create();
    berkas.write(html);
    if (!(await Sharing.isAvailableAsync())) return GAGAL_BAGIKAN;
    await Sharing.shareAsync(berkas.uri, {
      mimeType: 'application/msword',
      dialogTitle: `Laporan ${isi.periodeLabel}`,
    });
    return { ok: true };
  } catch (e) {
    console.warn('Ekspor Word gagal:', e);
    return { ok: false, pesan: `Gagal membuat berkas Word: ${teksError(e)}` };
  }
}