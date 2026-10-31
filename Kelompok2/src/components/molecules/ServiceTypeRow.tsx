import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { ServiceType } from '@/types/service';
import { AppText, Badge, IconButton } from '../atoms';

interface ServiceTypeRowProps {
  type: ServiceType;
  /** Jumlah layanan yang memakai jenis ini. */
  usageCount: number;
  onToggleActive: (active: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Satu jenis layanan: nama, status ketersediaan, pemakaian, dan aksi ubah/hapus. */
export function ServiceTypeRow({
  type,
  usageCount,
  onToggleActive,
  onEdit,
  onDelete,
}: ServiceTypeRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.texts}>
          <AppText variant="heading">{type.name}</AppText>
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            {usageCount > 0 ? `Dipakai ${usageCount} layanan` : 'Belum dipakai'}
          </AppText>
        </View>
        <Badge
          label={type.active ? 'Tersedia' : 'Tidak tersedia'}
          tone={type.active ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.actions}>
        <View style={styles.toggle}>
          <Switch
            value={type.active}
            onValueChange={onToggleActive}
            trackColor={{ false: '#D1D5DB', true: NotaryColors.emerald }}
            accessibilityLabel={`Tersedia untuk layanan baru: ${type.name}`}
          />
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            Tersedia di formulir
          </AppText>
        </View>
        <View style={styles.buttons}>
          <IconButton
            icon="create-outline"
            size={20}
            boxSize={38}
            color={NotaryColors.primary}
            backgroundColor="#EEF4F1"
            onPress={onEdit}
            accessibilityLabel={`Ubah nama ${type.name}`}
          />
          <IconButton
            icon="trash-outline"
            size={20}
            boxSize={38}
            color={NotaryColors.danger}
            backgroundColor="#FBECEC"
            onPress={onDelete}
            accessibilityLabel={`Hapus ${type.name}`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  texts: { flex: 1, gap: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: NotaryColors.border,
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttons: { flexDirection: 'row', gap: 8 },
});
