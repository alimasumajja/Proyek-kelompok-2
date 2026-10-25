import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Pembungkus kolom formulir: label di atas, kontrol, lalu pesan galat/petunjuk. */
export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="bodyStrong" style={styles.label}>
        {label}
        {required ? <AppText variant="bodyStrong" color={NotaryColors.danger}> *</AppText> : null}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" color={NotaryColors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: NotaryColors.textPrimary },
});
