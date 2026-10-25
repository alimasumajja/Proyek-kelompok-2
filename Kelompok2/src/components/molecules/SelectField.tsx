import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';
import { FormField } from './FormField';

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

/**
 * Pilihan dropdown. Daftar pilihan dibuka di tempat (inline) agar nyaman di dalam bottom sheet
 * dan tidak membutuhkan modal bertingkat.
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField label={label}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: value }}
        accessibilityState={{ expanded: open }}
        style={[styles.field, open && styles.fieldOpen]}>
        <AppText variant="bodyStrong" style={styles.value}>
          {value}
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
