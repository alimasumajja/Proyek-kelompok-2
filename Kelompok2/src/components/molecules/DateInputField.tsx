import React from 'react';
import { Input } from '../atoms';
import { FormField } from './FormField';

interface DateInputFieldProps {
  label: string;
  required?: boolean;
  /** Format HH-BB-TTTT, mis. 18-03-2026. */
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

/** "18032026" → "18-03-2026": tanda "-" ditambahkan otomatis saat mengetik. */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

/**
 * Kolom tanggal (HH-BB-TTTT) dengan tanda wajib (*), pesan galat, dan pemformatan otomatis.
 * Dibuat terpisah agar DateField milik tim tidak diubah. Validasinya memakai parseInputDate.
 */
export function DateInputField({
  label,
  required,
  value,
  onChangeText,
  error,
}: DateInputFieldProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Input
        value={value}
        onChangeText={(text) => onChangeText(maskDate(text))}
        placeholder="HH-BB-TTTT"
        keyboardType="number-pad"
        maxLength={10}
        invalid={!!error}
        accessibilityLabel={label}
      />
    </FormField>
  );
}