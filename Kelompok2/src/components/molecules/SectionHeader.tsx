import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
}

/** Judul bagian: teks kecil kapital (eyebrow) + judul, opsional tautan aksi di kanan. */
export function SectionHeader({
  eyebrow,
  title,
  actionLabel,
  onActionPress,
  actionAccessibilityLabel,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <AppText variant="eyebrow" color={NotaryColors.textMuted}>
          {eyebrow}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}>
          <AppText variant="label" color="#2D6A4F">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  texts: { gap: 2, flex: 1 },
});
