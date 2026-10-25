import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import type { NotificationItem, NotificationTone } from '@/types/service';
import { AppText } from '../atoms';

const TONE: Record<
  NotificationTone,
  { icon: React.ComponentProps<typeof Ionicons>['name']; fg: string; bg: string }
> = {
  danger: { icon: 'time-outline', fg: NotaryColors.badgeDangerText, bg: NotaryColors.badgeDangerBg },
  warning: { icon: 'warning-outline', fg: NotaryColors.badgeWarningText, bg: NotaryColors.badgeWarningBg },
  info: { icon: 'document-text-outline', fg: NotaryColors.badgeSuccessText, bg: NotaryColors.badgeSuccessBg },
};

export function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress?: () => void;
}) {
  const { icon, fg, bg } = TONE[item.tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.text}. ${item.time}${item.read ? '' : '. Belum dibaca'}`}
      style={[styles.row, !item.read && styles.unread]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={fg} />
      </View>
      <View style={styles.texts}>
        <AppText variant="heading">{item.title}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {item.text}
        </AppText>
        <AppText variant="micro" color="#9CA3AF">
          {item.time}
        </AppText>
      </View>
      {!item.read ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  unread: { backgroundColor: '#F7FBF9', borderRadius: 12, paddingHorizontal: 8 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  dot: { width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: NotaryColors.gold },
});
