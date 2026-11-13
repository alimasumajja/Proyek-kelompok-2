import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ServiceItem, StaffRef } from '@/types/service';
import { displayDateToInput, parseInputDate } from '@/utils/date';
import { Button } from '../atoms';
import { BottomSheet, DateField, InfoNote, SelectField } from '../molecules';

export interface AssignmentInput {
  staffId?: string;
  staffName: string;
  dueDate: Date;
}

interface AssignmentSheetProps {
  visible: boolean;
  service: ServiceItem;
  staffList?: StaffRef[];
  onClose: () => void;
  onSave: (input: AssignmentInput) => void;
}

/** Sheet "Ubah Penugasan & Target" (khusus Notaris) — perubahan masuk riwayat audit. */
export function AssignmentSheet({ visible, service, staffList, onClose, onSave }: AssignmentSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Ubah Penugasan & Target">
      <AssignmentForm service={service} staffList={staffList} onSave={onSave} />
    </BottomSheet>
  );
}

function AssignmentForm({ service, staffList, onSave }: Pick<AssignmentSheetProps, 'service' | 'staffList' | 'onSave'>) {
  const [staffName, setStaffName] = useState(service.assignedStaff.name);
  const [dateText, setDateText] = useState(displayDateToInput(service.dueDate));
  const [error, setError] = useState<string | undefined>();

  const availableStaffNames = staffList && staffList.length > 0
    ? staffList.map((s) => s.name)
    : [service.assignedStaff.name];

  const submit = () => {
    const dueDate = parseInputDate(dateText);
    if (!dueDate) {
      setError('Pilih tanggal target penyelesaian.');
      return;
    }
    const matchedStaff = staffList?.find((s) => s.name === staffName);
    onSave({
      staffId: matchedStaff?.id ?? service.assignedStaff.id,
      staffName,
      dueDate,
    });
  };

  return (
    <View style={styles.form}>
      <SelectField
        label="Penanggung jawab"
        value={staffName}
        options={availableStaffNames}
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
