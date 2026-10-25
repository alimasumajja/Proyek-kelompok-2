import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { FieldError, FieldLabel, fieldStyles } from './FormField';

interface Props {
  label: string;
  wajib?: boolean;
  placeholder?: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
  error?: string;
}

export default function SelectField({ label, wajib, placeholder, value, options, onChange, error }: Props) {
  const [buka, setBuka] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel label={label} wajib={wajib} />
      <Pressable
        onPress={() => setBuka(true)}
        style={[fieldStyles.box, styles.row, error ? { borderColor: colors.danger } : null]}
      >
        <Text style={{ color: value ? colors.text : colors.muted, fontSize: 14 }}>
          {value || placeholder || 'Pilih'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>
      <FieldError error={error} />

      <Modal visible={buka} transparent animationType="slide" onRequestClose={() => setBuka(false)}>
        <Pressable style={styles.overlay} onPress={() => setBuka(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setBuka(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && { color: colors.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {item === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '60%',
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', paddingHorizontal: 20, marginBottom: 8, color: colors.text },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: { fontSize: 15, color: colors.text },
});
