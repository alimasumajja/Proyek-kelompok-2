import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../constants/theme';

interface Props extends TextInputProps {
  label: string;
  wajib?: boolean;
  error?: string;
}

export function FieldLabel({ label, wajib }: { label: string; wajib?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {wajib ? <Text style={{ color: colors.danger }}> *</Text> : null}
    </Text>
  );
}

export function FieldError({ error }: { error?: string }) {
  return error ? <Text style={styles.error}>{error}</Text> : null;
}

export default function FormField({ label, wajib, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} wajib={wajib} />
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, rest.multiline && styles.multiline, error && styles.inputError, style]}
        {...rest}
      />
      <FieldError error={error} />
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  box: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, color: colors.text, marginBottom: 6, fontWeight: '500' },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
