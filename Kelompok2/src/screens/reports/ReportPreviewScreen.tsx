import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { setTemplate, setujuiLaporan, useLaporan, useLaporanStore } from '@/context/laporan-store';
import { useToast } from '@/context/toast';
import { useIsiDokumen } from '@/hooks/use-isi-dokumen';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { canApproveReport } from '@/utils/permissions';
import { NAMA_TEMPLATE, TEMPLATE_LAPORAN } from '@/utils/laporan-template';
import { AppText, Badge, Button } from '@/components/atoms';
import { InfoNote, SegmentedControl } from '@/components/molecules';
import { AppHeader } from '@/components/organisms';
import { KertasLaporan } from '@/components/laporan/KertasLaporan';
import {
  EksporSheet,
  MintaRevisiSheet,
  SetujuiDialog,
} from '@/components/laporan/DokumenSheets';

interface ReportPreviewScreenProps {
  onBack: () => void;
}

/** Pratinjau Laporan: tampilan dokumen, pilihan template, minta revisi, setujui, dan ekspor. */
export function ReportPreviewScreen({ onBack }: ReportPreviewScreenProps) {
  useStatusBarStyle('dark');
  const { showToast } = useToast();
  const { summary, aktaPeriode } = useLaporan();
  const { templateId } = useLaporanStore();
  const { isi, dokumen, versi, perluTinjau } = useIsiDokumen();
  const { actor } = useSession();
  // Persetujuan dan permintaan revisi laporan khusus Notaris (utils/permissions).
  const bolehMenyetujui = canApproveReport(actor);

  const [eksporOpen, setEksporOpen] = useState(false);
  const [revisiOpen, setRevisiOpen] = useState(false);
  const [setujuiOpen, setSetujuiOpen] = useState(false);

  const final = dokumen.status === 'Final';

  const setujui = () => {
    if (!bolehMenyetujui) return;
    setujuiLaporan(aktaPeriode, summary.periodeLabel);
    setSetujuiOpen(false);
    showToast('Laporan disetujui dan dikunci');
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Pratinjau Laporan"
        onBack={onBack}
        textAction={{ label: 'Ekspor', onPress: () => setEksporOpen(true) }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <Badge
            label={final ? 'Final' : 'Perlu Persetujuan'}
            tone={final ? 'success' : 'warning'}
          />
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            Versi {versi}
          </AppText>
        </View>

        <View style={styles.template}>
          <AppText variant="label" color={NotaryColors.textSecondary}>
            Template laporan
          </AppText>
          <SegmentedControl options={NAMA_TEMPLATE} value={templateId} onChange={setTemplate} />
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            {TEMPLATE_LAPORAN[templateId].deskripsi}
          </AppText>
        </View>

        <KertasLaporan isi={isi} />

        {final ? (
          <InfoNote
            tone="neutral"
            icon="lock-closed-outline"
            title={`Versi ${versi} sudah final`}
            text="Data dikunci sebagai snapshot. Revisi akan membuat versi baru."
          />
        ) : perluTinjau > 0 ? (
          <InfoNote
            title={`${perluTinjau} bagian perlu ditinjau`}
            text="Beberapa item validasi belum Lengkap. Sebaiknya selesaikan validasi sebelum menyetujui."
          />
        ) : null}

        {dokumen.status === 'Revisi Diminta' && dokumen.catatanRevisi ? (
          <InfoNote title="Revisi diminta" text={dokumen.catatanRevisi} />
        ) : null}

        {bolehMenyetujui ? (
          <View style={styles.aksi}>
            <View style={styles.slot}>
              <Button label="Minta Revisi" variant="outline" onPress={() => setRevisiOpen(true)} />
            </View>
            {!final ? (
              <View style={styles.slot}>
                <Button label="Setujui Laporan" onPress={() => setSetujuiOpen(true)} />
              </View>
            ) : null}
          </View>
        ) : (
          <InfoNote
            tone="neutral"
            icon="lock-closed-outline"
            title="Hanya Notaris yang dapat menyetujui"
            text="Persetujuan dan permintaan revisi laporan khusus Notaris. Anda tetap dapat meninjau dan mengekspor pratinjau."
          />
        )}

        <AppText variant="caption" color={NotaryColors.textMuted} style={styles.catatan}>
          Pratinjau ini adalah simulasi dan bukan pernyataan kepatuhan hukum resmi.
        </AppText>
      </ScrollView>

      <EksporSheet visible={eksporOpen} onClose={() => setEksporOpen(false)} />
      <MintaRevisiSheet visible={revisiOpen} onClose={() => setRevisiOpen(false)} />
      <SetujuiDialog
        visible={setujuiOpen}
        versi={`${dokumen.versiFinal + 1}.0`}
        onConfirm={setujui}
        onCancel={() => setSetujuiOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  template: { gap: 8 },
  aksi: { flexDirection: 'row', gap: 12 },
  slot: { flex: 1 },
  catatan: { textAlign: 'center' },
});