import React from 'react';
import { Input } from '../atoms';
import { FormField } from './FormField';

interface DateFieldProps {
  label: string;
  /** Format DD-MM-YYYY. */
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

/**
 * Kolom tanggal (DD-MM-YYYY). Memakai input teks bervalidasi agar berjalan di Expo Go
 * tanpa modul native tambahan; dapat diganti date picker native bila diperlukan.
 */
export function DateField({ label, value, onChangeText, error }: DateFieldProps) {
  return (
    <FormField label={label} error={error} hint="Format: HH-BB-TTTT, mis. 18-03-2026">
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="HH-BB-TTTT"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        invalid={!!error}
        accessibilityLabel={label}
      />
    </FormField>
  );
}
