import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import { useServiceFilters } from '@/hooks/use-service-filters';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceItem, ServiceTab } from '@/types/service';
import { ALL_TABS, getStaffNames } from '@/utils/service';
import { AppText, Chip } from '@/components/atoms';
import {
  EmptyState,
  NoticeBanner,
  SearchBar,
  SegmentedControl,
  ServiceCard,
} from '@/components/molecules';
import { AppHeader, ServiceFilterSheet } from '@/components/organisms';

interface LayananScreenProps {
  /** Filter awal dari navigasi (mis. ketukan kartu ringkasan di Beranda). */
  initialTab?: ServiceTab;
  /** Berubah setiap navigasi masuk agar filter yang sama tetap diterapkan ulang. */
  requestKey?: string;
  onAddService: () => void;
  /** Buka halaman Detail Layanan. */
  onOpenService: (serviceId: string) => void;
}

/** Halaman Layanan — PRD §6.5 & §6.11: daftar + bar progres, pencarian, dan filter. */
export function LayananScreen({
  initialTab = 'Semua',
  requestKey,
  onAddService,
  onOpenService,
}: LayananScreenProps) {
  useStatusBarStyle('dark');
  const { services } = useServiceStore();
  const staffOptions = useMemo(() => getStaffNames(services), [services]);

  const {
    filter,
    results,
    advancedActive,
    setTab,
    setQuery,
    setAdvanced,
    toggleSort,
    reset,
  } = useServiceFilters(services, initialTab);

  const [filterOpen, setFilterOpen] = useState(false);
  const openService = (item: ServiceItem) => onOpenService(item.id);

  // Terapkan filter yang dikirim dari Beranda, termasuk bila nilainya sama dengan sebelumnya.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, requestKey, setTab]);

  const showReset = filter.tab !== 'Semua' || advancedActive || filter.query.length > 0;

  const header = (
    <View style={styles.header}>
      <SearchBar
        value={filter.query}
        onChangeText={setQuery}
        onFilterPress={() => setFilterOpen(true)}
        filterActive={advancedActive}
      />

      {filter.tab === 'Perlu Perhatian' ? (
        <NoticeBanner
          text="Filter: Perlu Perhatian"
          actionLabel="Hapus"
          actionAccessibilityLabel="Hapus filter perlu perhatian"
          onActionPress={() => setTab('Semua')}
        />
      ) : null}

      {advancedActive ? (
        <View style={styles.chips}>
          {filter.stage ? (
            <Chip label={filter.stage} onRemove={() => setAdvanced({ ...filter, stage: null })} />
          ) : null}
          {filter.staff ? (
            <Chip label={filter.staff} onRemove={() => setAdvanced({ ...filter, staff: null })} />
          ) : null}
          {filter.priority ? (
            <Chip
              label={`Prioritas: ${filter.priority}`}
              onRemove={() => setAdvanced({ ...filter, priority: null })}
            />
          ) : null}
        </View>
      ) : null}

      <SegmentedControl options={ALL_TABS} value={filter.tab} onChange={setTab} />

      <View style={styles.subHeader}>
        <AppText variant="label" color={NotaryColors.textSecondary}>
          {results.length} layanan ditemukan
        </AppText>
        <Pressable
          onPress={showReset ? reset : toggleSort}
          hitSlop={8}
          style={styles.sortButton}
          accessibilityRole="button"
          accessibilityLabel={
            showReset
              ? 'Reset semua filter'
              : `Urutkan berdasarkan prioritas, ${filter.sortByPriority ? 'aktif' : 'nonaktif'}`
          }>
          <Ionicons
            name={showReset ? 'refresh-outline' : 'filter'}
            size={14}
            color={filter.sortByPriority && !showReset ? '#133E36' : '#2D6A4F'}
          />
          <AppText
            variant="label"
            color={filter.sortByPriority && !showReset ? '#133E36' : '#265D4F'}>
            {showReset ? 'Reset' : 'Prioritas'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Layanan"
        action={{ icon: 'add', label: 'Tambah layanan baru', onPress: onAddService }}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard item={item} onPress={openService} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="Tidak ada layanan ditemukan"
            description={
              filter.query
                ? `Tidak ada hasil untuk kata kunci "${filter.query}"`
                : 'Coba ubah kata kunci atau filter pencarian Anda.'
            }
            actionLabel={showReset ? 'Tampilkan Semua' : undefined}
            onActionPress={reset}
          />
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <ServiceFilterSheet
        visible={filterOpen}
        value={{ stage: filter.stage, staff: filter.staff, priority: filter.priority }}
        staffOptions={staffOptions}
        onApply={(next) => {
          setAdvanced(next);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  header: { gap: 12, marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 6 },
});
