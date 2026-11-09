import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { mintaRevisi } from '@/context/laporan-store';
import { useToast } from '@/context/toast';
import { useIsiDokumen } from '@/hooks/use-isi-dokumen';
import { STATUS_DOKUMEN_TONE } from '@/types/laporan';
import { eksporPdf, eksporWord, type HasilEkspor } from '@/utils/laporan-export';
import { AppText, Badge, Button, Input } from '../atoms';
import { BottomSheet, FormField, InfoNote } from '../molecules';

/** Sheet dan dialog alur dokumen laporan: minta revisi, ekspor, dan persetujuan. */

// ───────────────────────── Minta revisi ─────────────────────────

interface SheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Mengirim catatan revisi untuk laporan periode aktif. */
export function MintaRevisiSheet({ visible, onClose }: SheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Minta Revisi">
      {/* Form hanya ter-mount saat sheet terbuka, sehingga catatan selalu mulai kosong. */}
      <RevisiForm onClose={onClose} />
    </BottomSheet>
  );
}

function RevisiForm({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [mengirim, setMengirim] = useState(false);

  const kirim = async () => {
    if (mengirim) return;
    if (!catatan.trim()) {
      setError('Catatan revisi wajib diisi');
      return;
    }
    setMengirim(true);
    try {
      if (!(await mintaRevisi(catatan.trim()))) return;
      showToast('Permintaan revisi dikirim');
      onClose();
    } finally {
      setMengirim(false);
    }
  };

  return (
    <View style={revisiStyles.form}>
      <FormField label="Catatan revisi" required error={error}>
        <Input
          value={catatan}
          onChangeText={(v) => {
            setCatatan(v);
            if (error) setError(undefined);
          }}
          rows={5}
          invalid={!!error}
          placeholder="Jelaskan data atau bagian yang perlu diperbaiki"
          accessibilityLabel="Catatan revisi"
        />
      </FormField>
      <Button label="Kirim Permintaan" disabled={mengirim} onPress={kirim} />
    </View>
  );
}

const revisiStyles = StyleSheet.create({ form: { gap: 16 } });

// ───────────────────────── Ekspor ─────────────────────────

type Format = 'pdf' | 'word';

/** Pilihan unduh laporan sebagai PDF atau Word. */
export function EksporSheet({ visible, onClose }: SheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Ekspor Laporan">
      <EksporIsi onClose={onClose} />
    </BottomSheet>
  );
}

function EksporIsi({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const { isi, dokumen, versi, periodeLabel, jumlahAkta } = useIsiDokumen();
  const [sibuk, setSibuk] = useState<Format | null>(null);

  const jalankan = async (format: Format) => {
    setSibuk(format);
    const hasil: HasilEkspor =
      format === 'pdf' ? await eksporPdf(isi) : await eksporWord(isi, versi);
    setSibuk(null);
    if (hasil.ok) onClose();
    else showToast(hasil.pesan);
  };

  return (
    <View style={eksporStyles.isi}>
      <View style={eksporStyles.ringkasan}>
        <Ionicons name="document-text-outline" size={22} color={NotaryColors.primary} />
        <View style={eksporStyles.ringkasanTeks}>
          <AppText variant="bodyStrong">Laporan {periodeLabel}</AppText>
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            Versi {versi} · {jumlahAkta} akta
          </AppText>
        </View>
        <Badge label={dokumen.status} tone={STATUS_DOKUMEN_TONE[dokumen.status]} />
      </View>

      {dokumen.status !== 'Final' ? (
        <InfoNote text="Laporan belum final. Isi dokumen dapat berubah sebelum disetujui." />
      ) : null}

      <OpsiEkspor
        kode="PDF"
        warna="#B3402F"
        latar="#FBE9E6"
        judul="Unduh sebagai PDF"
        keterangan="Dokumen siap cetak"
        memuat={sibuk === 'pdf'}
        nonaktif={sibuk !== null}
        onPress={() => jalankan('pdf')}
      />
      <OpsiEkspor
        kode="DOC"
        warna="#2F5FA6"
        latar="#E6EEF9"
        judul="Unduh sebagai Word"
        keterangan="Dapat disunting"
        memuat={sibuk === 'word'}
        nonaktif={sibuk !== null}
        onPress={() => jalankan('word')}
      />
    </View>
  );
}

interface OpsiEksporProps {
  kode: string;
  warna: string;
  latar: string;
  judul: string;
  keterangan: string;
  memuat: boolean;
  nonaktif: boolean;
  onPress: () => void;
}

function OpsiEkspor({ kode, warna, latar, judul, keterangan, memuat, nonaktif, onPress }: OpsiEksporProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={nonaktif}
      accessibilityRole="button"
      accessibilityLabel={judul}
      accessibilityState={{ disabled: nonaktif, busy: memuat }}
      style={({ pressed }) => [eksporStyles.opsi, nonaktif && !memuat && eksporStyles.redup, pressed && eksporStyles.tekan]}>
      <View style={[eksporStyles.kode, { backgroundColor: latar }]}>
        <AppText variant="micro" color={warna} style={eksporStyles.kodeTeks}>
          {kode}
        </AppText>
      </View>
      <View style={eksporStyles.ringkasanTeks}>
        <AppText variant="bodyStrong">{judul}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {memuat ? 'Menyiapkan berkas…' : keterangan}
        </AppText>
      </View>
      <Ionicons name="download-outline" size={20} color={NotaryColors.textPrimary} />
    </Pressable>
  );
}

const eksporStyles = StyleSheet.create({
  isi: { gap: 12 },
  ringkasan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    backgroundColor: NotaryColors.statNormalBg,
  },
  ringkasanTeks: { flex: 1, gap: 2 },
  opsi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  tekan: { opacity: 0.85 },
  redup: { opacity: 0.5 },
  kode: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kodeTeks: { fontWeight: '700' },
});

// ───────────────────────── Dialog persetujuan ─────────────────────────

interface SetujuiDialogProps {
  visible: boolean;
  versi: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog "Setujui laporan final?". Dibuat sendiri karena `ConfirmDialog` milik tim
 * bertema bahaya (tombol dan ikon merah), sedangkan persetujuan memakai warna hijau.
 */
export function SetujuiDialog({ visible, versi, onConfirm, onCancel }: SetujuiDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={dialogStyles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Tutup dialog"
        />
        <View style={dialogStyles.card} accessibilityViewIsModal>
          <View style={dialogStyles.ikon}>
            <Ionicons name="checkmark" size={24} color={NotaryColors.primary} />
          </View>
          <AppText variant="title" style={dialogStyles.tengah} accessibilityRole="header">
            Setujui laporan final?
          </AppText>
          <AppText variant="body" color={NotaryColors.textSecondary} style={dialogStyles.tengah}>
            Versi {versi} akan dikunci sebagai snapshot yang dapat diaudit. Revisi setelah persetujuan akan
            membuat versi baru.
          </AppText>
          <View style={dialogStyles.aksi}>
            <View style={dialogStyles.slot}>
              <Button label="Batal" variant="outline" onPress={onCancel} />
            </View>
            <View style={dialogStyles.slot}>
              <Button label="Ya, Setujui" onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: Radius.xl,
    backgroundColor: '#FFFFFF',
  },
  ikon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: NotaryColors.statNormalBg,
  },
  tengah: { textAlign: 'center' },
  aksi: { flexDirection: 'row', gap: 12, marginTop: 16, alignSelf: 'stretch' },
  slot: { flex: 1 },
});