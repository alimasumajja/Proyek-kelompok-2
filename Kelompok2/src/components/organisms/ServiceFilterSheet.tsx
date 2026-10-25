import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SERVICE_PRIORITIES, SERVICE_STAGES } from '@/constants/service';
import type { FilterState, ServicePriority } from '@/types/service';
import { Button } from '../atoms';
import { BottomSheet, FilterGroup } from '../molecules';

export type AdvancedFilters = Pick<FilterState, 'stage' | 'staff' | 'priority'>;

interface ServiceFilterSheetProps {
  visible: boolean;
  /** Filter lanjutan yang sedang berlaku. */
  value: AdvancedFilters;
  staffOptions: string[];
  onApply: (next: AdvancedFilters) => void;
  onClose: () => void;
}

/**
 * Filter lanjutan: tahap, penanggung jawab, prioritas (PRD §6.11).
 * Pilihan disimpan sebagai draf dan baru berlaku saat "Terapkan Filter".
 */
export function ServiceFilterSheet({
  visible,
  value,
  staffOptions,
  onApply,
  onClose,
}: ServiceFilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Layanan">
      {/* FilterForm hanya ter-mount saat sheet terbuka, sehingga draf selalu mulai dari `value`. */}
      <FilterForm value={value} staffOptions={staffOptions} onApply={onApply} />
    </BottomSheet>
  );
}

type FilterFormProps = Pick<ServiceFilterSheetProps, 'value' | 'staffOptions' | 'onApply'>;

function FilterForm({ value, staffOptions, onApply }: FilterFormProps) {
  const [draft, setDraft] = useState<AdvancedFilters>(value);

  return (
    <>
      <FilterGroup
        title="Tahap Pengerjaan"
        allLabel="Semua tahap"
        options={SERVICE_STAGES}
        value={draft.stage as (typeof SERVICE_STAGES)[number] | null}
        onChange={(stage) => setDraft((d) => ({ ...d, stage }))}
      />
      <FilterGroup
        title="Penanggung Jawab"
        allLabel="Semua staf"
        options={staffOptions}
        value={draft.staff}
        onChange={(staff) => setDraft((d) => ({ ...d, staff }))}
      />
      <FilterGroup<ServicePriority>
        title="Prioritas"
        allLabel="Semua prioritas"
        options={SERVICE_PRIORITIES}
        value={draft.priority}
        onChange={(priority) => setDraft((d) => ({ ...d, priority }))}
      />

      <View style={styles.actions}>
        <Button label="Terapkan Filter" onPress={() => onApply(draft)} />
        <Button
          label="Reset Filter"
          variant="outline"
          onPress={() => onApply({ stage: null, staff: null, priority: null })}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 24, gap: 10 },
});
