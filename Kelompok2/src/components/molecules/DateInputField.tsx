import React from 'react';
import { DatePickerField, type DatePickerFieldProps } from './DatePickerField';

/**
 * Nama lama (Tambah Layanan). Kini memakai kalender, bukan ketik manual.
 * API tidak berubah: `value` & `onChangeText` tetap string "HH-BB-TTTT".
 */
export function DateInputField(props: DatePickerFieldProps) {
  return <DatePickerField {...props} />;
}
