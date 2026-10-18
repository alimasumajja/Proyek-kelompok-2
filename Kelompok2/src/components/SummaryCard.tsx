import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';

export type SummaryCardType = 'active' | 'completed' | 'late' | 'attention';

interface SummaryCardProps {
  type: SummaryCardType;
  count: number;
  label: string;
  footerText: string;
  onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  type,
  count,
  label,
  footerText,
  onPress,
}) => {
  const getCardConfig = () => {
    switch (type) {
      case 'active':
        return {
          icon: 'briefcase-outline' as const,
          iconColor: NotaryColors.summaryIcons.activeIcon,
          iconBg: NotaryColors.summaryIcons.activeBg,
        };
      case 'completed':
        return {
          icon: 'checkmark-outline' as const,
          iconColor: NotaryColors.summaryIcons.completedIcon,
          iconBg: NotaryColors.summaryIcons.completedBg,
        };
      case 'late':
        return {
          icon: 'time-outline' as const,
          iconColor: NotaryColors.summaryIcons.lateIcon,
          iconBg: NotaryColors.summaryIcons.lateBg,
        };
      case 'attention':
        return {
          icon: 'warning-outline' as const,
          iconColor: NotaryColors.summaryIcons.attentionIcon,
          iconBg: NotaryColors.summaryIcons.attentionBg,
        };
    }
  };

  const config = getCardConfig();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}. ${footerText}`}>
      <View style={styles.topSection}>
        <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.countText}>{count}</Text>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.footerText}>{footerText}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NotaryColors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  cardPressed: {
    opacity: 0.93,
    transform: [{ scale: 0.985 }],
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
  },
  countText: {
    fontSize: 22,
    fontWeight: '800',
    color: NotaryColors.textPrimary,
    lineHeight: 26,
  },
  labelText: {
    fontSize: 12,
    color: NotaryColors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11.5,
    color: NotaryColors.textMuted,
    fontWeight: '400',
  },
});
