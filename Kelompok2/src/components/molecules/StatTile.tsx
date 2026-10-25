import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

type StatTone = 'default' | 'danger' | 'success';

const TONE_COLOR: Record<StatTone, string> = {
  default: NotaryColors.textPrimary,
  danger: NotaryColors.danger,
  success: NotaryColors.badgeSuccessText,
};

interface StatTileProps {
  label: string;
  value: number | string;
  tone?: StatTone;
}

/** Angka ringkasan di tengah dengan label singkat di bawahnya (dipakai berjajar sama lebar). */
export function StatTile({ label, value, tone = 'default' }: StatTileProps) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="stat" color={TONE_COLOR[tone]}>
        {value}
      </AppText>
      <AppText
        variant="micro"
        color={NotaryColors.textSecondary}
        numberOfLines={1}
        style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  label: { textAlign: 'center' },
});
