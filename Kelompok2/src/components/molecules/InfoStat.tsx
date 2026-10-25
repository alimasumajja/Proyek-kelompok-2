import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FigmaTokens, NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

/** Label kecil di atas nilai tebal (mis. "Durasi tahap — 2 hari"). */
export function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="micro" color={NotaryColors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="label" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, gap: 4 },
  value: { fontFamily: FigmaTokens.fonts.bold },
});
