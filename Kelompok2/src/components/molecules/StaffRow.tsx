import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import type { StaffMember } from '@/types/profile';
import { AppText, Avatar, Badge } from '../atoms';

interface StaffRowProps {
  staff: StaffMember;
  onPress: (staff: StaffMember) => void;
  showDivider?: boolean;
}

/** Baris staf pada Manajemen Staf: avatar, nama, email, dan lencana status. */
export function StaffRow({ staff, onPress, showDivider = true }: StaffRowProps) {
  const active = staff.status === 'Aktif';
  return (
    <Pressable
      onPress={() => onPress(staff)}
      accessibilityRole="button"
      accessibilityLabel={`${staff.name}, ${staff.status}. Ketuk untuk mengubah`}
      style={({ pressed }) => [styles.row, showDivider && styles.divider, pressed && styles.pressed]}>
      <Avatar initials={staff.initials} size="md" />
      <View style={styles.texts}>
        <AppText variant="heading">{staff.name}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {staff.email}
        </AppText>
      </View>
      <Badge label={staff.status} tone={active ? 'success' : 'neutral'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: NotaryColors.borderLight },
  pressed: { backgroundColor: '#F7F9F8' },
  texts: { flex: 1, gap: 2 },
});
