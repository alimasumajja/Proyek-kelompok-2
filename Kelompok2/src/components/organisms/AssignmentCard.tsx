import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { ServiceItem } from '@/types/service';
import { formatDueDate, hasDueDate } from '@/utils/service';
import { AppText, Avatar, Badge } from '../atoms';

interface AssignmentCardProps {
  service: ServiceItem;
  supportName: string;
  /** Hanya Notaris yang dapat mengubah penanggung jawab/target (PRD §12). */
  canEdit: boolean;
  onEdit: () => void;
}

/** Kartu "Penugasan & Target": penanggung jawab, staf pendukung, dan target penyelesaian. */
export function AssignmentCard({ service, supportName, canEdit, onEdit }: AssignmentCardProps) {
  const late = service.status === 'Terlambat';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <AppText variant="title">Penugasan & Target</AppText>
        {canEdit ? (
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ubah penugasan dan target">
            <AppText variant="bodyStrong" color={NotaryColors.emerald}>
              Ubah
            </AppText>
          </Pressable>
        ) : (
          <Badge label="Notaris" tone="neutral" icon="lock-closed-outline" />
        )}
      </View>

      <View style={styles.assignee}>
        <Avatar initials={service.assignedStaff.initials} size="lg" tone="soft" />
        <View style={styles.texts}>
          <AppText variant="micro" color={NotaryColors.textSecondary}>
            Penanggung jawab
          </AppText>
          <AppText variant="heading">{service.assignedStaff.name}</AppText>
          <AppText variant="micro" color={NotaryColors.textSecondary}>
            Pendukung: {supportName}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.target}>
        <Ionicons name="calendar-outline" size={20} color={NotaryColors.primary} />
        <View style={styles.texts}>
          <AppText variant="micro" color={NotaryColors.textSecondary}>
            Target penyelesaian
          </AppText>
          <AppText variant="heading">{formatDueDate(service.dueDate)}</AppText>
        </View>
        {hasDueDate(service.dueDate) ? (
          <Badge label={late ? 'Terlewati' : 'Sesuai target'} tone={late ? 'danger' : 'success'} />
        ) : (
          <Badge label="Belum diatur" tone="neutral" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  assignee: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  texts: { flex: 1, gap: 2 },
  divider: { height: 1, marginVertical: 16, backgroundColor: NotaryColors.border },
  target: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
