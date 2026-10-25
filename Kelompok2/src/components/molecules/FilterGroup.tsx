import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText, Chip } from '../atoms';

interface FilterGroupProps<T extends string> {
  title: string;
  /** Teks pilihan "tanpa filter", mis. "Semua tahap". */
  allLabel: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
}

/** Satu kelompok pilihan filter (chip tunggal) dengan opsi "Semua …" di awal. */
export function FilterGroup<T extends string>({
  title,
  allLabel,
  options,
  value,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <View style={styles.group}>
      <AppText variant="eyebrow" color={NotaryColors.textSecondary} style={styles.title}>
        {title.toUpperCase()}
      </AppText>
      <View style={styles.chips}>
        <Chip label={allLabel} selected={value === null} onPress={() => onChange(null)} />
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 14 },
  title: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
