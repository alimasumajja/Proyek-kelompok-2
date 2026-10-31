import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { formatDateId, formatInputDate, parseInputDate } from '@/utils/date';
import { AppText, Button } from '../atoms';
import { BottomSheet } from './BottomSheet';
import { FormField } from './FormField';

export interface DatePickerFieldProps {
  label: string;
  required?: boolean;
  /** Nilai "HH-BB-TTTT" (mis. 18-03-2026), atau '' bila belum dipilih. */
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * Kolom tanggal dengan kalender native (bukan ketik manual).
 * - Android: dialog kalender sistem.
 * - iOS: kalender inline di dalam bottom sheet.
 * Nilainya tetap string "HH-BB-TTTT" sehingga kompatibel dengan parseInputDate dan layar lama.
 * Kolom opsional (tidak required) bisa dikosongkan kembali lewat tombol ×.
 */
export function DatePickerField({
  label,
  required,
  value,
  onChangeText,
  error,
  placeholder = 'Pilih tanggal',
  minimumDate,
  maximumDate,
}: DatePickerFieldProps) {
  const selected = parseInputDate(value);
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(selected ?? new Date());

  const open = () => {
    const start = selected ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: start,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChangeText(formatInputDate(date));
        },
      });
      return;
    }
    setDraft(start);
    setIosOpen(true);
  };

  const spoken = selected ? formatDateId(selected) : 'belum dipilih';

  return (
    <FormField label={label} required={required} error={error}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${spoken}. Ketuk untuk membuka kalender`}
        style={[styles.field, !!error && styles.fieldInvalid]}>
        <Ionicons name="calendar-outline" size={18} color={NotaryColors.primary} />
        <AppText
          variant="bodyStrong"
          color={selected ? NotaryColors.textPrimary : '#9CA3AF'}
          style={styles.value}>
          {selected ? formatDateId(selected) : placeholder}
        </AppText>
        {selected && !required ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Hapus ${label}`}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </Pressable>

      {Platform.OS === 'ios' ? (
        <BottomSheet visible={iosOpen} onClose={() => setIosOpen(false)} title={label}>
          <View style={styles.sheet}>
            <DateTimePicker
              value={draft}
              mode="date"
              display="inline"
              locale="id-ID"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_, date) => date && setDraft(date)}
            />
            <Button
              label="Pilih Tanggal"
              onPress={() => {
                onChangeText(formatInputDate(draft));
                setIosOpen(false);
              }}
            />
          </View>
        </BottomSheet>
      ) : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  fieldInvalid: { borderColor: NotaryColors.danger },
  value: { flex: 1 },
  sheet: { gap: 12 },
});
