import React from 'react';
import type { ActivityItem } from '@/types/service';
import { AppText } from '../atoms';
import { TimelineRow } from './TimelineRow';

const DOT_COLOR: Record<ActivityItem['type'], string> = {
  update: '#25705E',
  issue: '#C87818',
  completed: '#1E7E68',
};

interface ActivityItemRowProps {
  item: ActivityItem;
  isLast?: boolean;
}

/** Baris aktivitas terbaru di Beranda. */
export function ActivityItemRow({ item, isLast = false }: ActivityItemRowProps) {
  return (
    <TimelineRow
      title={
        <>
          <AppText variant="heading">{item.actor} </AppText>
          {item.action}
        </>
      }
      text={item.description}
      time={item.time}
      color={DOT_COLOR[item.type]}
      isLast={isLast}
    />
  );
}
