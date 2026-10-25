import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { staffDirectory } from '@/data/dummy';
import type { ServiceItem } from '@/types/service';
import { displayDateToInput, parseInputDate } from '@/utils/date';
import { Button } from '../atoms';
import { BottomSheet, DateField, InfoNote, SelectField } from '../molecules';

export interface AssignmentInput {
  staffName: string;
  dueDate: Date;
}

interface AssignmentSheetProps {
  visible: boolean;
  service: ServiceItem;
  onClose: () => void;
  onSave: (input: AssignmentInput) => void;
}

/** Sheet "Ubah Penugasan & Target" (khusus Notaris) — perubahan masuk riwayat audit. */
export function AssignmentSheet({ visible, service, onClose, onSave }: AssignmentSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Ubah Penugasan & Target">
      <AssignmentForm service={service} onSave={onSave} />
    </BottomSheet>
  );
}

function AssignmentForm({ service, onSave }: Pick<AssignmentSheetProps, 'service' | 'onSave'>) {
  const [staffName, setStaffName] = useState(service.assignedStaff.name);
  const [dateText, setDateText] = useState(displayDateToInput(service.dueDate));
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const dueDate = parseInputDate(dateText);
    if (!dueDate) {
      setError('Tanggal tidak valid. Gunakan format HH-BB-TTTT.');
      return;
    }
    onSave({ staffName, dueDate });
  };

  return (
    <View style={styles.form}>
      <SelectField
        label="Penanggung jawab"
        value={staffName}
        options={staffDirectory}
        onChange={setStaffName}
      />
      <DateField
        label="Target penyelesaian"
        value={dateText}
        onChangeText={(text) => {
          setDateText(text);
          setError(undefined);
        }}
        error={error}
      />
      <InfoNote text="Perubahan akan ditambahkan ke riwayat audit." />
      <Button label="Simpan Perubahan" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
