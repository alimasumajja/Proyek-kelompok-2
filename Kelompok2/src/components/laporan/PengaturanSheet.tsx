import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { simpanNomorSurat, simpanPengaturan, useLaporanStore } from '@/context/laporan-store';
import { useToast } from '@/context/toast';
import type { KopLaporan, PengaturanLaporan } from '@/types/laporan';
import { LEBAR_MARGIN, PENGATURAN_DEFAULT, UKURAN_FONT } from '@/utils/laporan-pengaturan';
import { AppText, Button, Input } from '../atoms';
import { BottomSheet, FormField, InfoNote, SegmentedControl } from '../molecules';

/** Sheet pengaturan kop surat, penerima, dan tampilan kertas, serta sheet nomor surat. */

interface PengaturanSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Laporan periode ini sudah Final: tampilannya memakai pengaturan saat disetujui. */
  final: boolean;
}

export function PengaturanSheet({ visible, onClose, final }: PengaturanSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Atur Template Laporan">
      {/* Form hanya ter-mount saat sheet terbuka, sehingga isiannya selalu mulai dari data tersimpan. */}
      <PengaturanForm final={final} onClose={onClose} />
    </BottomSheet>
  );
}

type GalatKop = Partial<Record<keyof KopLaporan, string>>;
interface Galat {
  kop: GalatKop;
  penerima?: string;
}

const KOLOM_WAJIB: { kunci: keyof KopLaporan; label: string; hint?: string }[] = [
  { kunci: 'namaNotaris', label: 'Nama notaris (pada kop)', hint: 'Mis. Nama Notaris, S.H., M.Kn.' },
  { kunci: 'jabatan', label: 'Jabatan dan wilayah', hint: 'Mis. Notaris di Kabupaten Majalengka' },
  { kunci: 'alamat', label: 'Alamat kantor' },
];

function PengaturanForm({ final, onClose }: { final: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const { pengaturan } = useLaporanStore();
  const [draf, setDraf] = useState<PengaturanLaporan>(pengaturan);
  const [galat, setGalat] = useState<Galat>({ kop: {} });
  const [menyimpan, setMenyimpan] = useState(false);

  const ubah = (patch: Partial<PengaturanLaporan>) => setDraf((prev) => ({ ...prev, ...patch }));
  const ubahKop = (kunci: keyof KopLaporan, nilai: string) =>
    setDraf((prev) => ({ ...prev, kop: { ...prev.kop, [kunci]: nilai } }));

  const simpan = async () => {
    if (menyimpan) return;
    const kop: KopLaporan = {
      namaNotaris: draf.kop.namaNotaris.trim(),
      jabatan: draf.kop.jabatan.trim(),
      wilayah: draf.kop.wilayah.trim(),
      alamat: draf.kop.alamat.trim(),
      telepon: draf.kop.telepon.trim(),
      kota: draf.kop.kota.trim(),
      namaTtd: draf.kop.namaTtd.trim(),
    };
    const penerima = draf.penerima.trim();

    const errorKop: GalatKop = {};
    if (!kop.namaNotaris) errorKop.namaNotaris = 'Nama notaris wajib diisi';
    if (!kop.jabatan) errorKop.jabatan = 'Jabatan wajib diisi';
    if (!kop.alamat) errorKop.alamat = 'Alamat wajib diisi';
    if (!kop.kota) errorKop.kota = 'Kota wajib diisi (dipakai pada tanda tangan)';
    if (!kop.namaTtd) errorKop.namaTtd = 'Nama pada tanda tangan wajib diisi';
    const next: Galat = { kop: errorKop, penerima: penerima ? undefined : 'Penerima surat wajib diisi' };
    setGalat(next);
    if (Object.keys(errorKop).length > 0 || next.penerima) return;

    setMenyimpan(true);
    try {
      // Form tetap terbuka bila gagal; pesan kesalahan ditampilkan oleh store.
      if (!(await simpanPengaturan({ ...draf, kop, penerima }))) return;
      showToast('Pengaturan template disimpan');
      onClose();
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <View style={styles.form}>
      {final ? (
        <InfoNote
          tone="neutral"
          icon="lock-closed-outline"
          title="Laporan periode ini sudah Final"
          text="Tampilannya tetap memakai pengaturan saat disetujui. Perubahan berlaku untuk laporan berikutnya."
        />
      ) : null}
      <InfoNote
        tone="neutral"
        title="Berlaku untuk seluruh kantor"
        text="Format laporan mengikuti Laporan Bulanan Notaris ke MPDN. Pengaturan ini dipakai bersama pada pratinjau, PDF, dan Word."
      />

      <AppText variant="heading">Kop surat</AppText>
      {KOLOM_WAJIB.map(({ kunci, label, hint }) => (
        <FormField key={kunci} label={label} required error={galat.kop[kunci]} hint={hint}>
          <Input
            value={draf.kop[kunci]}
            onChangeText={(v) => ubahKop(kunci, v)}
            invalid={!!galat.kop[kunci]}
            accessibilityLabel={label}
          />
        </FormField>
      ))}
      <FormField label="Provinsi (opsional)" hint="Tampil setelah jabatan, mis. – Jawa Barat">
        <Input value={draf.kop.wilayah} onChangeText={(v) => ubahKop('wilayah', v)} accessibilityLabel="Provinsi" />
      </FormField>
      <FormField label="Nomor telepon (opsional)" hint="Mis. Nomor HP 0812xxxxxxx">
        <Input value={draf.kop.telepon} onChangeText={(v) => ubahKop('telepon', v)} accessibilityLabel="Nomor telepon" />
      </FormField>

      <AppText variant="heading">Surat dan tanda tangan</AppText>
      <FormField label="Penerima surat" required error={galat.penerima} hint="Satu baris per teks, tampil setelah 'Kepada Yth.'">
        <Input
          value={draf.penerima}
          onChangeText={(v) => ubah({ penerima: v })}
          rows={3}
          invalid={!!galat.penerima}
          accessibilityLabel="Penerima surat"
        />
      </FormField>
      <FormField label="Kota" required error={galat.kop.kota} hint="Dipakai pada 'Kota, tanggal' di tanda tangan">
        <Input
          value={draf.kop.kota}
          onChangeText={(v) => ubahKop('kota', v)}
          invalid={!!galat.kop.kota}
          accessibilityLabel="Kota"
        />
      </FormField>
      <FormField label="Nama pada tanda tangan" required error={galat.kop.namaTtd} hint="Mis. NAMA NOTARIS, S.H., M.Kn.">
        <Input
          value={draf.kop.namaTtd}
          onChangeText={(v) => ubahKop('namaTtd', v)}
          invalid={!!galat.kop.namaTtd}
          accessibilityLabel="Nama pada tanda tangan"
        />
      </FormField>

      <AppText variant="heading">Tampilan kertas</AppText>
      <FormField label="Ukuran font">
        <SegmentedControl options={UKURAN_FONT} value={draf.ukuranFont} onChange={(v) => ubah({ ukuranFont: v })} />
      </FormField>
      <FormField label="Margin" hint="Berlaku pada PDF dan Word.">
        <SegmentedControl options={LEBAR_MARGIN} value={draf.margin} onChange={(v) => ubah({ margin: v })} />
      </FormField>

      <Button label="Simpan Pengaturan" disabled={menyimpan} onPress={simpan} />
      <Button
        label="Kembalikan ke Bawaan"
        variant="outline"
        disabled={menyimpan}
        onPress={() => {
          setGalat({ kop: {} });
          setDraf(PENGATURAN_DEFAULT);
        }}
      />
    </View>
  );
}

// ───────────────────────── Nomor surat ─────────────────────────

interface NomorSuratSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Nomor yang tersimpan atau disarankan untuk periode ini. */
  nilaiAwal: string;
}

/** Mengisi nomor surat pengantar untuk periode aktif, mis. 005/NOT/X/2026. */
export function NomorSuratSheet({ visible, onClose, nilaiAwal }: NomorSuratSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nomor Surat">
      <NomorSuratForm nilaiAwal={nilaiAwal} onClose={onClose} />
    </BottomSheet>
  );
}

function NomorSuratForm({ nilaiAwal, onClose }: { nilaiAwal: string; onClose: () => void }) {
  const { showToast } = useToast();
  const [nomor, setNomor] = useState(nilaiAwal);
  const [error, setError] = useState<string | undefined>();
  const [menyimpan, setMenyimpan] = useState(false);

  const simpan = async () => {
    if (menyimpan) return;
    const bersih = nomor.trim();
    if (!bersih) {
      setError('Nomor surat wajib diisi');
      return;
    }
    if (bersih.length > 60) {
      setError('Nomor surat terlalu panjang');
      return;
    }
    setMenyimpan(true);
    try {
      if (!(await simpanNomorSurat(bersih))) return;
      showToast('Nomor surat disimpan');
      onClose();
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <View style={styles.form}>
      <InfoNote
        tone="neutral"
        title="Isi manual sekali, selanjutnya mengikuti"
        text="Untuk laporan pertama, ketik nomor lengkap. Untuk bulan-bulan berikutnya aplikasi menyarankan nomor yang meneruskan urutan, dan Anda tetap bisa mengubahnya."
      />
      <FormField label="Nomor surat" required error={error} hint="Contoh: 005/NOT/X/2026">
        <Input
          value={nomor}
          onChangeText={(v) => {
            setNomor(v);
            setError(undefined);
          }}
          invalid={!!error}
          autoCapitalize="characters"
          accessibilityLabel="Nomor surat"
        />
      </FormField>
      <Button label="Simpan Nomor Surat" disabled={menyimpan} onPress={simpan} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
});
