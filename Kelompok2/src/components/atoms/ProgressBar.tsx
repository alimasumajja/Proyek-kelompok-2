import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { clampPercent } from '@/utils/service';

interface ProgressBarProps {
  /** 0–100. Dihitung dari tahap layanan, bukan waktu berjalan (PRD §6.5). */
  value: number;
  height?: number;
}

export function ProgressBar({ value, height = 6.5 }: ProgressBarProps) {
  const percent = clampPercent(value);
  return (
    <View
      style={[styles.track, { height, borderRadius: height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}>
      <View style={[styles.fill, { width: `${percent}%`, borderRadius: height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: NotaryColors.progressTrack, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: NotaryColors.progressFill },
});
