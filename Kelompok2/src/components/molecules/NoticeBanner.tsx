import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface NoticeBannerProps {
  text: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
}

/** Banner peringatan kuning, mis. "Filter: Perlu Perhatian" + tombol Hapus. */
export function NoticeBanner({
  text,
  actionLabel,
  onActionPress,
  actionAccessibilityLabel,
}: NoticeBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="warning" size={15} color={NotaryColors.amber} />
        <AppText variant="label" color={NotaryColors.badgeWarningText}>
          {text}
        </AppText>
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}>
          <AppText variant="caption" color={NotaryColors.badgeWarningText}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    backgroundColor: '#FFF2DE',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFFFF',
  },
});
