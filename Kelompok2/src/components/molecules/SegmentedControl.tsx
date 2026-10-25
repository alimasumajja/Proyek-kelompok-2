import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
}

/** Kontrol segmen (Semua / Aktif / Terlambat / Selesai). Generik agar dapat dipakai ulang. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Tab ${option}`}
            style={[styles.segment, active && styles.segmentActive]}>
            <AppText
              variant={active ? 'label' : 'caption'}
              color={active ? NotaryColors.textPrimary : NotaryColors.textSecondary}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: NotaryColors.segmentBg,
    borderRadius: Radius.lg,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: NotaryColors.segmentActiveBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});
