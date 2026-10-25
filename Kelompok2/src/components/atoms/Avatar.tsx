import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getInitials } from '@/utils/service';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from './AppText';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarTone = 'soft' | 'solid' | 'light';

const SIZE: Record<AvatarSize, { box: number; font: number }> = {
  sm: { box: 24, font: 10 },
  md: { box: 38, font: 13 },
  lg: { box: 44, font: 15 },
};

interface AvatarProps {
  /** Inisial siap pakai; jika kosong dihitung dari `name`. */
  initials?: string;
  name?: string;
  size?: AvatarSize;
  /** soft: hijau muda · solid: hijau tua · light: putih (di atas header gelap). */
  tone?: AvatarTone;
}

export function Avatar({ initials, name = '', size = 'sm', tone = 'soft' }: AvatarProps) {
  const { box, font } = SIZE[size];
  const text = initials ?? getInitials(name);
  const palette = TONE[tone];

  return (
    <View
      style={[
        styles.base,
        { width: box, height: box, borderRadius: box / 2, backgroundColor: palette.bg },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <AppText variant="micro" color={palette.fg} style={{ fontSize: font, lineHeight: font + 3 }}>
        {text}
      </AppText>
    </View>
  );
}

const TONE: Record<AvatarTone, { bg: string; fg: string }> = {
  soft: { bg: '#D1DDD8', fg: '#264D43' },
  solid: { bg: NotaryColors.primary, fg: '#FFFFFF' },
  light: { bg: '#FFFFFF', fg: NotaryColors.primary },
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
