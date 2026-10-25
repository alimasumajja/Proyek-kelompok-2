import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Shadow } from '@/constants/notary-theme';
import type { NearestDeadline } from '@/types/service';
import { AppText, Avatar } from '../atoms';

interface DeadlineCardProps {
  item: NearestDeadline;
  onPress?: () => void;
}

export function DeadlineCard({ item, onPress }: DeadlineCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Target terdekat tanggal ${item.day} ${item.month}: ${item.serviceType}, ${item.clientAndStage}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.dateBox}>
        <AppText variant="title" style={styles.day}>
          {item.day}
        </AppText>
        <AppText variant="micro" color="#1B5248" style={styles.month}>
          {item.month}
        </AppText>
      </View>

      <View style={styles.middle}>
        <AppText variant="heading">{item.serviceType}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {item.clientAndStage}
        </AppText>
        <View style={styles.staff}>
          <Avatar initials={item.staff.initials} size="sm" />
          <AppText variant="caption" color="#4B5563">
            {item.staff.name}
          </AppText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  dateBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4F1',
  },
  day: { lineHeight: 22 },
  month: { letterSpacing: 0.5 },
  middle: { flex: 1, gap: 3 },
  staff: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
});
