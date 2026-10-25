import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { FigmaTokens, NotaryColors, Radius } from '@/constants/notary-theme';

interface InputProps extends TextInputProps {
  invalid?: boolean;
  /** Tinggi minimal baris untuk kolom multi-baris. */
  rows?: number;
}

/** Kolom isian teks dasar (satu/banyak baris) dengan status galat. */
export function Input({ invalid = false, rows, multiline, style, ...rest }: InputProps) {
  return (
    <TextInput
      multiline={multiline ?? !!rows}
      textAlignVertical={multiline || rows ? 'top' : 'center'}
      placeholderTextColor="#9CA3AF"
      style={[
        styles.input,
        rows ? { minHeight: rows * 22 + 28 } : null,
        invalid && styles.invalid,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    color: NotaryColors.textPrimary,
    fontFamily: FigmaTokens.fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  invalid: { borderColor: NotaryColors.danger },
});
