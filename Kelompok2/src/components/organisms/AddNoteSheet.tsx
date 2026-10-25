import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NoteCategory } from '@/types/service';
import { Button, Input } from '../atoms';
import { BottomSheet, FormField, InfoNote, SelectField } from '../molecules';

export const NOTE_CATEGORIES: readonly NoteCategory[] = [
  'Pembaruan Progres',
  'Kendala',
  'Instruksi',
  'Catatan Klien',
  'Catatan Internal',
];

export interface NoteDraft {
  category: NoteCategory;
  text: string;
}

interface AddNoteSheetProps {
  visible: boolean;
  draft: NoteDraft;
  onDraftChange: (draft: NoteDraft) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenAi: () => void;
}

/**
 * Sheet "Tambah Catatan": teks saja, tanpa lampiran (PRD §5.2).
 * Draf dikontrol dari luar agar tidak hilang saat berpindah ke Asisten AI.
 */
export function AddNoteSheet({
  visible,
  draft,
  onDraftChange,
  onClose,
  onSave,
  onOpenAi,
}: AddNoteSheetProps) {
  const isIssue = draft.category === 'Kendala';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Tambah Catatan">
      <View style={styles.form}>
        <SelectField
          label="Kategori"
          value={draft.category}
          options={NOTE_CATEGORIES}
          onChange={(category) => onDraftChange({ ...draft, category })}
        />

        <FormField label="Catatan">
          <Input
            value={draft.text}
            onChangeText={(text) => onDraftChange({ ...draft, text })}
            rows={5}
            placeholder={
              isIssue
                ? 'Jelaskan masalah, kondisi saat ini, dan tindak lanjut...'
                : 'Tulis pembaruan secara jelas...'
            }
            accessibilityLabel="Isi catatan"
          />
        </FormField>

        {isIssue ? (
          <InfoNote text="Mencatat kendala tidak mengubah tahap atau progres layanan." />
        ) : null}

        <Button label="Bantu Susun dengan AI" icon="sparkles-outline" variant="outline" onPress={onOpenAi} />
        <Button label="Simpan Catatan" disabled={draft.text.trim().length === 0} onPress={onSave} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
