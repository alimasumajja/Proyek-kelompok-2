import React from 'react';
import { SelectField, type SelectFieldProps } from './SelectField';

/**
 * Nama lama (Tambah Layanan). Sekarang hanya pembungkus <SelectField />, yang sudah mendukung
 * placeholder, tanda wajib (*), dan pesan galat — tidak ada lagi kode ganda.
 */
export function PickerField<T extends string>(
  props: SelectFieldProps<T> & { placeholder: string }
) {
  return <SelectField {...props} />;
}
