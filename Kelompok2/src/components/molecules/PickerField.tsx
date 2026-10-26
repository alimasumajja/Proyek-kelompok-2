import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';
import { FormField } from './FormField';

interface PickerFieldProps<T extends string> {
  label: string;
  required?: boolean;
  /** Teks saat belum ada pilihan, mis. "Pilih jenis layanan". */
  placeholder: string;
  value: T | '';
  options: readonly T[];
  onChange: (value: T) => void;
  error?: string;
}

/**
 * Dropdown dengan placeholder, tanda wajib (*), dan pesan galat.
 * Tampilannya sama dengan <SelectField />; dibuat terpisah agar SelectField milik tim tidak diubah.
 */
export function PickerField<T extends string>({
  label,
  required,
  placeholder,
  value,
  options,
  onChange,
  error,
}: PickerFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField label={label} required={required} error={error}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: value || placeholder }}
        accessibilityState={{ expanded: open }}
        style={[styles.field, open && styles.fieldOpen, !!error && styles.fieldInvalid]}>
        <AppText variant="bodyStrong" style={styles.value}>
          {value || placeholder}
        </AppText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={NotaryColors.textSecondary}
        />
      </Pressable>
      {open ? (
        <View style={styles.list}>
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                <AppText
                  variant={selected ? 'bodyStrong' : 'body'}
                  color={selected ? NotaryColors.primary : NotaryColors.textPrimary}
                  style={styles.value}>
                  {option}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={18} color={NotaryColors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  fieldOpen: { borderColor: NotaryColors.primary },
  fieldInvalid: { borderColor: NotaryColors.danger },
  value: { flex: 1 },
  list: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  optionPressed: { backgroundColor: '#F2F5F3' },
});