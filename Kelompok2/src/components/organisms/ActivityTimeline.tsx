import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Shadow } from '@/constants/notary-theme';
import type { ActivityItem } from '@/types/service';
import { ActivityItemRow } from '../molecules';

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <ActivityItemRow key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
});
