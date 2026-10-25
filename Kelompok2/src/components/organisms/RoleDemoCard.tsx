import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import type { UserRole } from '@/types/service';
import { AppText } from '../atoms';

interface RoleDemoCardProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

const OPTIONS: {
  role: UserRole;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
}[] = [
  { role: 'Notaris', icon: 'briefcase-outline', description: 'Akses penuh & persetujuan' },
  { role: 'Staf', icon: 'person-outline', description: 'Akses operasional' },
];

/**
 * Mode Demo: berpindah peran Notaris/Staf untuk memeriksa pembatasan akses.
 * Peran tersimpan di service-store sehingga berlaku di seluruh aplikasi.
 */
export function RoleDemoCard({ role, onChange }: RoleDemoCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = option.role === role;
          return (
            <Pressable
              key={option.role}
              onPress={() => onChange(option.role)}
              accessibilityRole="radio"
              accessibilityLabel={`${option.role}. ${option.description}`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name={option.icon}
                size={20}
                color={selected ? NotaryColors.primary : NotaryColors.textMuted}
              />
              <View style={styles.texts}>
                <AppText
                  variant="heading"
                  color={selected ? NotaryColors.textPrimary : NotaryColors.textSecondary}>
                  {option.role}
                </AppText>
                <AppText variant="micro" color={NotaryColors.textSecondary}>
                  {option.description}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="caption" color={NotaryColors.textMuted}>
        Pembatasan antarmuka ini juga harus diterapkan kembali pada backend dan database produksi.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: { borderColor: NotaryColors.primary, backgroundColor: NotaryColors.segmentBg },
  pressed: { opacity: 0.88 },
  texts: { flex: 1, gap: 2 },
});
