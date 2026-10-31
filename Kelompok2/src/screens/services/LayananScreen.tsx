import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { useSession } from '@/hooks/use-session';
import { useServiceFilters } from '@/hooks/use-service-filters';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceItem, ServiceTab } from '@/types/service';
import { ALL_TABS, getStaffNames } from '@/utils/service';
import { AppText, Chip } from '@/components/atoms';
import {
  EmptyState,
  InfoNote,
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
  /** Buka halaman Detail Layanan. */
  onOpenService: (serviceId: string) => void;
  /** Buka Kelola Jenis Layanan (hanya ditampilkan untuk Notaris). */
  onManageTypes?: () => void;
}

/**
 * Halaman Layanan — PRD §6.5 & §6.11: daftar + bar progres, pencarian, filter, dan urut prioritas.
 * Filter menyaring (tab, kata kunci, tahap/staf/prioritas); "Urut prioritas" hanya menyusun ulang
 * daftar dan jumlah layanan tidak berubah. Keduanya menampilkan statusnya secara jelas.
 * Menambah layanan dilakukan lewat menu "Tambah" di bottom navigation, bukan dari header halaman ini.
 */
export function LayananScreen({
  initialTab = 'Semua',
  requestKey,
  onOpenService,
  onManageTypes,
}: LayananScreenProps) {
  useStatusBarStyle('dark');
  // Staf hanya mendapat layanan yang ditugaskan kepadanya (lihat utils/permissions).
  const { services, isNotaris } = useSession();
  const staffOptions = useMemo(() => getStaffNames(services), [services]);

  const {
    filter,
    results,
    advancedCount,
    anyFilterActive,
    setTab,
    setQuery,
    setAdvanced,
    setSort,
    clearFilters,
  } = useServiceFilters(services, initialTab);

  const [filterOpen, setFilterOpen] = useState(false);
  const openService = (item: ServiceItem) => onOpenService(item.id);

  // Terapkan filter yang dikirim dari Beranda, termasuk bila nilainya sama dengan sebelumnya.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, requestKey, setTab]);

  const sortByPriority = filter.sort === 'priority';

  const header = (
    <View style={styles.header}>
      {!isNotaris ? (
        <InfoNote
          tone="neutral"
          icon="person-outline"
          text="Menampilkan layanan yang ditugaskan kepada Anda."
        />
      ) : null}
      <SearchBar
        value={filter.query}
        onChangeText={setQuery}
        onFilterPress={() => setFilterOpen(true)}
        filterCount={advancedCount}
      />

      {filter.tab === 'Perlu Perhatian' ? (
        <NoticeBanner
          text="Filter: Perlu Perhatian"
          actionLabel="Hapus"
          actionAccessibilityLabel="Hapus filter perlu perhatian"
          onActionPress={() => setTab('Semua')}
        />
      ) : null}

      {anyFilterActive ? (
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
          <Pressable
            onPress={clearFilters}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Hapus semua filter">
            <Ionicons name="close-circle-outline" size={15} color={NotaryColors.primary} />
            <AppText variant="label" color={NotaryColors.primary}>
              Hapus filter
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <SegmentedControl options={ALL_TABS} value={filter.tab} onChange={setTab} />

      <View style={styles.subHeader}>
        <AppText variant="label" color={NotaryColors.textSecondary}>
          {results.length} layanan ditemukan
        </AppText>
        <Pressable
          onPress={() => setSort(sortByPriority ? 'default' : 'priority')}
          hitSlop={6}
          style={[styles.sortToggle, sortByPriority && styles.sortToggleActive]}
          accessibilityRole="switch"
          accessibilityLabel="Urut prioritas"
          accessibilityHint="Menampilkan layanan berprioritas tinggi lebih dahulu"
          accessibilityState={{ checked: sortByPriority }}>
          <Ionicons
            name={sortByPriority ? 'checkmark' : 'swap-vertical'}
            size={14}
            color={sortByPriority ? '#FFFFFF' : NotaryColors.textSecondary}
          />
          <AppText
            variant="label"
            color={sortByPriority ? '#FFFFFF' : NotaryColors.textSecondary}>
            Urut prioritas
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Layanan"
        action={
          isNotaris && onManageTypes
            ? { icon: 'settings-outline', label: 'Kelola jenis layanan', onPress: onManageTypes }
            : undefined
        }
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
            actionLabel={anyFilterActive ? 'Hapus filter' : undefined}
            onActionPress={clearFilters}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 4 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  sortToggleActive: { borderColor: NotaryColors.primary, backgroundColor: NotaryColors.primary },
});
