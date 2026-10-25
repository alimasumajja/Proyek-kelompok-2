import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

/** Baris pengaturan dengan kotak centang di kanan (mis. jenis notifikasi). */
export function ToggleRow({ title, description, checked, onToggle }: ToggleRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.texts}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {description}
        </AppText>
      </View>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
      </View>
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
  texts: { flex: 1, gap: 2 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C0C7CE',
    backgroundColor: '#FFFFFF',
  },
  boxChecked: { borderColor: NotaryColors.primary, backgroundColor: NotaryColors.primary },
});
