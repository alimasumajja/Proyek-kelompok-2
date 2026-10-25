import React from 'react';
import { Text, type TextProps } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { Typography, type TextVariant } from '@/constants/typography';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** Atom teks dasar: semua teks aplikasi lewat sini agar font & ukuran konsisten. */
export function AppText({
  variant = 'body',
  color = NotaryColors.textPrimary,
  style,
  ...rest
}: AppTextProps) {
  return <Text style={[Typography[variant], { color }, style]} {...rest} />;
}
