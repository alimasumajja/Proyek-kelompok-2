import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from './AppText';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'gold';

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: NotaryColors.badgeSuccessBg, fg: NotaryColors.badgeSuccessText },
  warning: { bg: NotaryColors.badgeWarningBg, fg: NotaryColors.badgeWarningText },
  danger: { bg: NotaryColors.badgeDangerBg, fg: NotaryColors.badgeDangerText },
  neutral: { bg: NotaryColors.badgeNeutralBg, fg: NotaryColors.badgeNeutralText },
  info: { bg: NotaryColors.badgeInfoBg, fg: NotaryColors.badgeInfoText },
  gold: { bg: NotaryColors.badgeGoldBg, fg: NotaryColors.badgeGoldText },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Pill (bulat penuh) atau kotak membulat kecil. */
  shape?: 'pill' | 'square';
}

export function Badge({ label, tone = 'neutral', icon, shape = 'pill' }: BadgeProps) {
  const { bg, fg } = TONES[tone];
  return (
    <View
      style={[styles.base, { backgroundColor: bg, borderRadius: shape === 'pill' ? 14 : 6 }]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} style={styles.icon} /> : null}
      <AppText variant="micro" color={fg} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: { marginRight: 4 },
  label: { fontSize: 11 },
});
