import React from 'react';
import { DatePickerField, type DatePickerFieldProps } from './DatePickerField';

/** Kolom tanggal berkalender. Dipertahankan sebagai nama lama agar layar yang sudah memakainya tidak berubah. */
export function DateField(props: DatePickerFieldProps) {
  return <DatePickerField {...props} />;
}
