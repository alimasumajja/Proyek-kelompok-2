import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { formatTanggal } from '../utils/format';
import { FieldError, FieldLabel, fieldStyles } from './FormField';

interface Props {
  label: string;
  wajib?: boolean;
  value?: string; // ISO
  onChange: (iso: string) => void;
  error?: string;
}

export default function DateField({ label, wajib, value, onChange, error }: Props) {
  const [tampil, setTampil] = useState(false);
  const tanggal = value ? new Date(value) : new Date();

  const picker = (
    <DateTimePicker
      value={tanggal}
      mode="date"
      display={Platform.OS === 'ios' ? 'inline' : 'default'}
      onChange={(event, d) => {
        if (Platform.OS === 'android') setTampil(false);
        if (event.type === 'set' && d) onChange(d.toISOString());
      }}
    />
  );

  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel label={label} wajib={wajib} />
      <Pressable
        onPress={() => setTampil(true)}
        style={[fieldStyles.box, styles.row, error ? { borderColor: colors.danger } : null]}
      >
        <Text style={{ color: value ? colors.text : colors.muted, fontSize: 14 }}>
          {value ? formatTanggal(value) : 'Pilih tanggal'}
        </Text>
        <Ionicons name="calendar-outline" size={16} color={colors.muted} />
      </Pressable>
      <FieldError error={error} />

      {tampil && Platform.OS === 'android' && picker}
      {Platform.OS === 'ios' && (
        <Modal visible={tampil} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              {picker}
              <Pressable style={styles.done} onPress={() => setTampil(false)}>
                <Text style={styles.doneText}>Selesai</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  done: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  doneText: { color: colors.white, fontWeight: '700' },
});
