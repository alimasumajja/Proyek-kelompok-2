import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet, ActionListItem, InfoNote } from '../molecules';

interface ServiceActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenAi: () => void;
}

/** Menu "⋯" pada Detail Layanan. */
export function ServiceActionsSheet({
  visible,
  onClose,
  onOpenHistory,
  onOpenAi,
}: ServiceActionsSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Tindakan Layanan">
      <View style={styles.list}>
        <ActionListItem
          icon="time-outline"
          title="Lihat riwayat lengkap"
          description="Perubahan tidak dapat dihapus diam-diam"
          onPress={onOpenHistory}
        />
        <ActionListItem
          icon="sparkles-outline"
          title="Buka Asisten AI"
          description="Gunakan hanya teks yang dipilih"
          onPress={onOpenAi}
        />
        <InfoNote text="Status Ditunda atau Dibatalkan memerlukan alasan dan otorisasi. Aturan ini masih dapat dikonfigurasi sesuai kebijakan kantor." />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
