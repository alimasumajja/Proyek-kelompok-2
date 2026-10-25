import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { ServiceItem } from '@/types/service';
import { formatPercent } from '@/utils/service';
import { AppText, ProgressBar } from '../atoms';
import { InfoStat } from '../molecules';

interface ProgressSummaryCardProps {
  service: ServiceItem;
  stageStartedAt: string;
  stageDuration: string;
  totalDuration: string;
}

/** Kartu progres keseluruhan + durasi (PRD §6.5). */
export function ProgressSummaryCard({
  service,
  stageStartedAt,
  stageDuration,
  totalDuration,
}: ProgressSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headTexts}>
          <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
            PROGRES KESELURUHAN
          </AppText>
          <AppText variant="title" style={styles.stage}>
            {service.currentStage}
          </AppText>
        </View>
        <AppText variant="display" style={styles.percent}>
          {formatPercent(service.progressPercent)}
        </AppText>
      </View>

      <ProgressBar value={service.progressPercent} height={8} />
      <AppText variant="micro" color={NotaryColors.textSecondary} style={styles.note}>
        Dihitung dari tahap yang diselesaikan, bukan waktu berjalan.
      </AppText>

      <View style={styles.divider} />

      <View style={styles.stats}>
        <InfoStat label="Mulai tahap" value={stageStartedAt} />
        <InfoStat label="Durasi tahap" value={stageDuration} />
        <InfoStat label="Total durasi" value={totalDuration} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  headTexts: { flex: 1, gap: 6 },
  stage: { fontSize: 20, lineHeight: 26 },
  percent: { fontSize: 30, lineHeight: 36, color: NotaryColors.primary },
  note: { marginTop: 8 },
  divider: { height: 1, marginVertical: 16, backgroundColor: NotaryColors.border },
  stats: { flexDirection: 'row', gap: 8 },
});
