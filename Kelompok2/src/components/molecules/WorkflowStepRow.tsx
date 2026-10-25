import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import type { WorkflowStepState } from '@/types/service';
import { AppText, Badge } from '../atoms';

interface WorkflowStepRowProps {
  number: number;
  name: string;
  state: WorkflowStepState;
  /** Keterangan di bawah nama tahap (mis. "Selesai · 8 Mar 2026, 16.20"). */
  caption: string;
  repeatCount?: number;
  isLast?: boolean;
}

/** Satu tahap pada alur kerja: penanda (centang/nomor), nama, keterangan, garis penghubung. */
export function WorkflowStepRow({
  number,
  name,
  state,
  caption,
  repeatCount = 0,
  isLast = false,
}: WorkflowStepRowProps) {
  return (
    <View style={styles.row} accessibilityLabel={`Tahap ${number}, ${name}. ${caption}`}>
      <View style={styles.indicator}>
        <View
          style={[
            styles.marker,
            state === 'done' && styles.markerDone,
            state === 'current' && styles.markerCurrent,
            state === 'skipped' && styles.markerSkipped,
          ]}>
          {state === 'done' ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : (
            <AppText
              variant="caption"
              color={state === 'current' ? NotaryColors.primary : NotaryColors.textMuted}>
              {number}
            </AppText>
          )}
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={styles.texts}>
        <View style={styles.nameRow}>
          <AppText variant="heading">{name}</AppText>
          {repeatCount > 0 ? <Badge label={`Diulang ${repeatCount + 1}x`} tone="warning" /> : null}
        </View>
        <AppText variant="micro" color={NotaryColors.textSecondary}>
          {caption}
        </AppText>
      </View>
    </View>
  );
}

const MARKER = 34;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, minHeight: 56 },
  indicator: { alignItems: 'center', width: MARKER },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 1,
    borderColor: '#D5DBD7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  markerDone: { backgroundColor: NotaryColors.emerald, borderColor: NotaryColors.emerald },
  markerCurrent: { borderColor: NotaryColors.emerald, borderWidth: 2, backgroundColor: '#FFFFFF' },
  markerSkipped: { borderColor: NotaryColors.amber, borderStyle: 'dashed' },
  line: { flex: 1, width: 1.5, marginVertical: 2, backgroundColor: NotaryColors.timelineLine },
  texts: { flex: 1, gap: 3, paddingTop: 2, paddingBottom: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
