import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface TimelineRowProps {
  title: React.ReactNode;
  text: string;
  time: string;
  /** Warna titik penanda. */
  color: string;
  isLast?: boolean;
}

/** Satu baris timeline: titik + garis vertikal, judul, keterangan, dan waktu di kanan. */
export function TimelineRow({ title, text, time, color, isLast = false }: TimelineRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.indicator}>
        <View style={[styles.outerDot, { borderColor: color }]}>
          <View style={[styles.innerDot, { backgroundColor: color }]} />
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.texts}>
          <AppText variant="bodyStrong">{title}</AppText>
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            {text}
          </AppText>
        </View>
        <AppText variant="caption" color={NotaryColors.textMuted}>
          {time}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 56 },
  indicator: { alignItems: 'center', width: 28, marginRight: 8 },
  outerDot: {
    width: 18,
    height: 18,
    marginTop: 2,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  innerDot: { width: 8, height: 8, borderRadius: 4 },
  line: { flex: 1, width: 1.5, marginVertical: 4, backgroundColor: '#E5E7EB' },
  content: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 22 },
  texts: { flex: 1, paddingRight: 12, gap: 3 },
});
