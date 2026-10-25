import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import { AppText } from '../atoms';

export type SummaryCardType = 'active' | 'completed' | 'late' | 'attention';

const CONFIG: Record<
  SummaryCardType,
  { icon: React.ComponentProps<typeof Ionicons>['name']; fg: string; bg: string }
> = {
  active: {
    icon: 'briefcase-outline',
    fg: NotaryColors.summaryIcons.activeIcon,
    bg: NotaryColors.summaryIcons.activeBg,
  },
  completed: {
    icon: 'checkmark-outline',
    fg: NotaryColors.summaryIcons.completedIcon,
    bg: NotaryColors.summaryIcons.completedBg,
  },
  late: {
    icon: 'time-outline',
    fg: NotaryColors.summaryIcons.lateIcon,
    bg: NotaryColors.summaryIcons.lateBg,
  },
  attention: {
    icon: 'warning-outline',
    fg: NotaryColors.summaryIcons.attentionIcon,
    bg: NotaryColors.summaryIcons.attentionBg,
  },
};

interface SummaryCardProps {
  type: SummaryCardType;
  count: number;
  label: string;
  footerText: string;
  onPress?: () => void;
}

export function SummaryCard({ type, count, label, footerText, onPress }: SummaryCardProps) {
  const { icon, fg, bg } = CONFIG[type];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}. ${footerText}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={fg} />
        </View>
        <View style={styles.texts}>
          <AppText variant="stat">{count}</AppText>
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            {label}
          </AppText>
        </View>
      </View>
      <View style={styles.divider} />
      <AppText variant="caption" color={NotaryColors.textMuted}>
        {footerText}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  pressed: { opacity: 0.93, transform: [{ scale: 0.985 }] },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginBottom: 8 },
});
