import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSheetDraft } from '@/hooks/use-sheet-draft';
import type { NotificationPrefs } from '@/types/profile';
import { Button } from '../atoms';
import { BottomSheet, ToggleRow } from '../molecules';

interface NotificationSettingsSheetProps {
  visible: boolean;
  prefs: NotificationPrefs;
  onClose: () => void;
  onSave: (prefs: NotificationPrefs) => void;
}

/** Sheet "Pengaturan Notifikasi": pilih jenis pemberitahuan yang ingin diterima. */
export function NotificationSettingsSheet({
  visible,
  prefs,
  onClose,
  onSave,
}: NotificationSettingsSheetProps) {
  const [draft, setDraft] = useSheetDraft(visible, prefs);

  const toggle = (key: keyof NotificationPrefs) => setDraft({ ...draft, [key]: !draft[key] });

  const save = () => {
    onSave(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pengaturan Notifikasi">
      <View style={styles.list}>
        <ToggleRow
          title="Target mendekat"
          description="Pengingat sebelum tenggat"
          checked={draft.deadlineNear}
          onToggle={() => toggle('deadlineNear')}
        />
        <ToggleRow
          title="Kendala baru"
          description="Saat staf menambahkan kendala"
          checked={draft.newIssue}
          onToggle={() => toggle('newIssue')}
        />
        <ToggleRow
          title="Layanan tanpa pembaruan"
          description="Layanan aktif yang lama tidak diperbarui"
          checked={draft.noUpdate}
          onToggle={() => toggle('noUpdate')}
        />
        <Button label="Simpan Pengaturan" onPress={save} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
