import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from './AppText';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  color?: string;
  /** Ukuran area sentuh (min. 40 agar nyaman di mobile). */
  boxSize?: number;
  /** Latar tombol (mis. translucent di header gelap atau putih bergaris di bar pencarian). */
  backgroundColor?: string;
  borderColor?: string;
  /** Bentuk tombol: lingkaran atau persegi membulat (sesuai referensi Figma). */
  shape?: 'circle' | 'square';
  /** Angka lencana di pojok kanan atas; disembunyikan jika 0/undefined. */
  badgeCount?: number;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 22,
  color = NotaryColors.textPrimary,
  boxSize = 40,
  backgroundColor,
  borderColor,
  shape = 'circle',
  badgeCount,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: shape === 'circle' ? boxSize / 2 : 14,
          backgroundColor,
          borderColor,
          borderWidth: borderColor ? 1 : 0,
        },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={size} color={color} />
      {badgeCount ? (
        <View style={styles.badge}>
          <AppText variant="micro" color={NotaryColors.primary} style={styles.badgeText}>
            {badgeCount}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: NotaryColors.headerNotifBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9.5, lineHeight: 12 },
});
