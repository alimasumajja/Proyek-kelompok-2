import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Lebar mengikuti isi (untuk tombol kecil) alih-alih penuh. */
  compact?: boolean;
}

const PALETTE: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: NotaryColors.primary, fg: '#FFFFFF' },
  secondary: { bg: NotaryColors.segmentBg, fg: NotaryColors.primary },
  outline: { bg: 'transparent', fg: NotaryColors.textSecondary, border: '#D1D5DB' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
  icon,
}: ButtonProps) {
  const { bg, fg, border } = PALETTE[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.full,
        { backgroundColor: bg, borderColor: border, borderWidth: border ? 1 : 0 },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      {/* Teks satu baris yang boleh menyusut: tidak meluap saat dua tombol berbagi satu baris
          atau saat pengguna memakai ukuran huruf sistem yang besar. */}
      <AppText
        variant="heading"
        color={fg}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        maxFontSizeMultiplier={1.2}
        style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { paddingVertical: 14, paddingHorizontal: 12, alignSelf: 'stretch' },
  compact: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.md },
  label: { flexShrink: 1 },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.6 },
});
