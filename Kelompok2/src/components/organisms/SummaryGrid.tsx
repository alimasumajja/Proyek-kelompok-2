import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { OperationalSummary, ServiceTab } from '@/types/service';
import { SummaryCard } from '../molecules';

interface SummaryGridProps {
  summary: OperationalSummary;
  /** Dipanggil saat kartu diketuk; membawa filter tujuan untuk halaman Layanan. */
  onSelect: (tab: ServiceTab) => void;
}

/** Grid ringkasan 2×2: aktif, selesai, terlambat, perlu perhatian (PRD §6.2). */
export function SummaryGrid({ summary, onSelect }: SummaryGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <SummaryCard
          type="active"
          count={summary.activeCount}
          label="Layanan Aktif"
          footerText="Ketuk untuk melihat"
          onPress={() => onSelect('Aktif')}
        />
        <SummaryCard
          type="completed"
          count={summary.completedCount}
          label="Layanan Selesai"
          footerText="Total"
          onPress={() => onSelect('Selesai')}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          type="late"
          count={summary.lateCount}
          label="Terlambat"
          footerText="Perlu tindakan"
          onPress={() => onSelect('Terlambat')}
        />
        <SummaryCard
          type="attention"
          count={summary.attentionCount}
          label="Perlu Perhatian"
          footerText={
            summary.newIssueCount > 0
              ? `${summary.newIssueCount} kendala tercatat`
              : 'Tidak ada kendala'
          }
          onPress={() => onSelect('Perlu Perhatian')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
});
