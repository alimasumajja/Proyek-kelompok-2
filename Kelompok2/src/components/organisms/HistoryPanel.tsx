import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { ActivityTone, ServiceActivity } from '@/types/service';
import { TimelineRow } from '../molecules';

const TONE_COLOR: Record<ActivityTone, string> = {
  green: '#2F6B57',
  blue: '#3F7A8A',
  amber: '#C4872F',
};

/** Tab Riwayat: audit trail perubahan layanan (PRD §6.9). */
export function HistoryPanel({ activities }: { activities: ServiceActivity[] }) {
  return (
    <View style={styles.card}>
      {activities.map((activity, index) => (
        <TimelineRow
          key={activity.id}
          title={activity.title}
          text={activity.text}
          time={activity.time}
          color={TONE_COLOR[activity.tone]}
          isLast={index === activities.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 18,
    paddingHorizontal: 18,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
});
