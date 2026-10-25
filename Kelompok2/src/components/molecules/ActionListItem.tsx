import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface ActionListItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  onPress: () => void;
}

/** Baris aksi pada daftar tindakan (ikon, judul, keterangan, panah). */
export function ActionListItem({ icon, title, description, onPress }: ActionListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={NotaryColors.primary} />
      </View>
      <View style={styles.texts}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {description}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C0C7CE" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  pressed: { opacity: 0.85 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4F1',
  },
  texts: { flex: 1, gap: 2 },
});
