import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Shadow } from '@/constants/notary-theme';
import type { ServiceItem } from '@/types/service';
import { formatDueDate, formatPercent } from '@/utils/service';
import { AppText, Avatar, ProgressBar } from '../atoms';
import { StatusBadge } from './StatusBadge';

interface ServiceCardProps {
  item: ServiceItem;
  onPress?: (item: ServiceItem) => void;
}

/**
 * Kartu layanan: nomor, status, klien, tahap + bar progres, penanggung jawab, target.
 * Sesuai PRD §6.5 (daftar layanan menampilkan bar progres, tahap aktif, persentase,
 * penanggung jawab, dan target penyelesaian).
 */
export function ServiceCard({ item, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={`Layanan ${item.code}, klien ${item.clientName}, status ${item.status}, ${formatPercent(item.progressPercent)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <AppText variant="label" color="#265D4F" style={styles.code}>
          {item.code}
        </AppText>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.content}>
        <AppText variant="title">{item.clientName}</AppText>
        <AppText variant="body" color={NotaryColors.textSecondary}>
          {item.serviceType}
        </AppText>
      </View>

      <View style={styles.progress}>
        <View style={styles.stageRow}>
          <AppText variant="label" color="#374151" style={styles.stageName}>
            {item.currentStage}
          </AppText>
          <AppText variant="label" color="#1B5248">
            {formatPercent(item.progressPercent)}
          </AppText>
        </View>
        <ProgressBar value={item.progressPercent} />
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Avatar initials={item.assignedStaff.initials} size="sm" />
          <AppText variant="label" color="#4B5563">
            {item.assignedStaff.name}
          </AppText>
        </View>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color={NotaryColors.textSecondary} />
          <AppText variant="caption" color="#4B5563">
            {formatDueDate(item.dueDate)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  code: { letterSpacing: 0.3 },
  content: { marginBottom: 14, gap: 4 },
  progress: { marginBottom: 16, gap: 8 },
  stageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stageName: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
