import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import type { ServiceItem, ServiceNote } from '@/types/service';
import { AppText, Badge, Button, Input } from '../atoms';
import { BottomSheet, InfoNote, SelectField } from '../molecules';

const HELP_OPTIONS = [
  'Ringkas Progres',
  'Ringkas Kebutuhan Klien',
  'Buat Checklist',
  'Bantu Susun Narasi',
] as const;
type HelpOption = (typeof HELP_OPTIONS)[number];

interface AiAssistantSheetProps {
  visible: boolean;
  service: ServiceItem;
  notes: ServiceNote[];
  onClose: () => void;
  /** Dipanggil saat "Gunakan Draf" ditekan, membawa teks draf yang sudah (opsional) disunting. */
  onUseDraft: (text: string) => void;
}

/**
 * Asisten AI (PRD §8). Saat ini SIMULASI lokal tanpa memanggil provider eksternal:
 * draf hanya disusun dari data layanan yang ada (tidak mengarang fakta), diberi label
 * "Draft dari AI", dan wajib ditinjau. Integrasi LLM nyata (Fase 3) lewat backend/Edge Function.
 */
export function AiAssistantSheet({
  visible,
  service,
  notes,
  onClose,
  onUseDraft,
}: AiAssistantSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Asisten AI">
      <AiAssistantForm service={service} notes={notes} onUseDraft={onUseDraft} />
    </BottomSheet>
  );
}

function buildDraft(help: HelpOption, service: ServiceItem, notes: ServiceNote[]): string {
  const issue = notes.find((n) => n.category === 'Kendala');
  const base = `Layanan ${service.serviceType} atas nama ${service.clientName} sedang berada pada tahap ${service.currentStage} (${service.progressPercent}%). Penanggung jawab: ${service.assignedStaff.name}, target penyelesaian ${service.dueDate}.`;
  const issueText = issue ? ` Kendala tercatat: ${issue.text}` : '';

  switch (help) {
    case 'Ringkas Kebutuhan Klien':
      return `${service.clientName} membutuhkan layanan ${service.serviceType}.`;
    case 'Buat Checklist':
      return `Checklist tahap ${service.currentStage}:\n- Periksa kelengkapan informasi layanan\n- Konfirmasi tindak lanjut dengan ${service.assignedStaff.name}\n- Catat hasil pada progres layanan`;
    case 'Bantu Susun Narasi':
      return `${base}${issueText} Mohon ditinjau sebelum digunakan.`;
    default:
      return `${base}${issueText}`;
  }
}

function AiAssistantForm({
  service,
  notes,
  onUseDraft,
}: Pick<AiAssistantSheetProps, 'service' | 'notes' | 'onUseDraft'>) {
  const [help, setHelp] = useState<HelpOption>(HELP_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const generate = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      setDraft(buildDraft(help, service, notes));
      setLoading(false);
      setCopied(false);
    }, 700);
  };

  const copy = async () => {
    if (!draft) return;
    await Clipboard.setStringAsync(draft);
    setCopied(true);
  };

  return (
    <View style={styles.form}>
      <InfoNote
        icon="lock-closed-outline"
        title="Periksa informasi sensitif"
        text="Teks yang dipilih dapat dikirim ke penyedia AI eksternal untuk diproses."
      />

      <SelectField label="Pilih bantuan" value={help} options={HELP_OPTIONS} onChange={setHelp} />

      <View style={styles.context}>
        <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
          KONTEKS TERPILIH
        </AppText>
        <AppText variant="caption">
          Catatan progres dan kendala pada layanan ini ({notes.length} pembaruan).
        </AppText>
      </View>

      {draft === null ? (
        <Button
          label={loading ? 'Menyusun draf...' : 'Buat Draf'}
          icon={loading ? undefined : 'sparkles-outline'}
          disabled={loading}
          onPress={generate}
        />
      ) : (
        <View style={styles.result}>
          <View style={styles.resultHead}>
            <Badge label="Draf AI" tone="gold" icon="sparkles-outline" />
            <AppText
              variant="label"
              color={NotaryColors.emerald}
              onPress={copy}
              accessibilityRole="button"
              accessibilityLabel="Salin draf">
              {copied ? 'Tersalin' : 'Salin'}
            </AppText>
          </View>
          <Input value={draft} onChangeText={setDraft} rows={6} accessibilityLabel="Draf AI" />
          <AppText variant="label">Draft dari AI — wajib ditinjau sebelum digunakan.</AppText>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button label="Buat Ulang" variant="outline" onPress={generate} />
            </View>
            <View style={styles.flex}>
              <Button label="Gunakan Draf" onPress={() => onUseDraft(draft)} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  context: {
    gap: 6,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  result: { gap: 12 },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
