import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import type { ServiceItem } from '@/types/service';
import {
  getActionKind,
  getNextStageOptions,
  STAGE_ACTIONS,
  type StageAction,
} from '@/utils/service-workflow';
import { AppText, Button, Input } from '../atoms';
import { BottomSheet, FormField, InfoNote, SelectField } from '../molecules';

export interface StageUpdateInput {
  action: StageAction;
  nextStage: string;
  note: string;
}

interface StageUpdateSheetProps {
  visible: boolean;
  service: ServiceItem;
  onClose: () => void;
  onConfirm: (input: StageUpdateInput) => void;
}

/** Sheet "Perbarui Tahap": lanjut, ulangi revisi, atau lewati pendaftaran — semua tercatat di riwayat. */
export function StageUpdateSheet({ visible, service, onClose, onConfirm }: StageUpdateSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Perbarui Tahap">
      <StageUpdateForm service={service} onConfirm={onConfirm} />
    </BottomSheet>
  );
}

function StageUpdateForm({
  service,
  onConfirm,
}: Pick<StageUpdateSheetProps, 'service' | 'onConfirm'>) {
  const [action, setAction] = useState<StageAction>(STAGE_ACTIONS[0]);
  const [nextStage, setNextStage] = useState(service.currentStage);
  const [note, setNote] = useState('');

  const kind = getActionKind(action);
  const needsReason = kind === 'skip';
  const disabled = needsReason && note.trim().length === 0;

  return (
    <View style={styles.form}>
      <View style={styles.current}>
        <AppText variant="micro" color={NotaryColors.textSecondary}>
          Tahap saat ini
        </AppText>
        <AppText variant="heading">{service.currentStage}</AppText>
      </View>

      <SelectField label="Jenis perubahan" value={action} options={STAGE_ACTIONS} onChange={setAction} />

      {kind === 'advance' ? (
        <SelectField
          label="Pilih tahap berikutnya"
          value={nextStage}
          options={getNextStageOptions(service.currentStage)}
          onChange={setNextStage}
        />
      ) : null}

      <FormField
        label={needsReason ? 'Alasan wajib' : 'Catatan progres (opsional)'}
        required={needsReason}>
        <Input
          value={note}
          onChangeText={setNote}
          rows={3}
          placeholder="Tambahkan konteks perubahan tahap"
          invalid={needsReason && note.length > 0 && note.trim().length === 0}
          accessibilityLabel="Catatan perubahan tahap"
        />
      </FormField>

      <InfoNote text="Perubahan, pengulangan, dan tahap yang dilewati akan tercatat dalam riwayat audit." />

      <Button
        label="Konfirmasi Perubahan"
        disabled={disabled}
        onPress={() => onConfirm({ action, nextStage, note })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  current: {
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: NotaryColors.segmentBg,
  },
});
