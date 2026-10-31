import { useCallback, useMemo, useState } from 'react';
import type { FilterState, ServiceItem, ServiceSort, ServiceTab } from '@/types/service';
import {
  countAdvancedFilters,
  filterServices,
  hasActiveFilters,
  hasAdvancedFilters,
  INITIAL_FILTER,
} from '@/utils/service';

/** State & hasil filter/pencarian daftar layanan (logika murni ada di utils/service). */
export function useServiceFilters(services: ServiceItem[], initialTab: ServiceTab = 'Semua') {
  const [filter, setFilter] = useState<FilterState>({ ...INITIAL_FILTER, tab: initialTab });

  const results = useMemo(() => filterServices(services, filter), [services, filter]);

  const setTab = useCallback((tab: ServiceTab) => setFilter((f) => ({ ...f, tab })), []);
  const setQuery = useCallback((query: string) => setFilter((f) => ({ ...f, query })), []);
  const setAdvanced = useCallback(
    (next: Pick<FilterState, 'stage' | 'staff' | 'priority'>) =>
      setFilter((f) => ({ ...f, ...next })),
    []
  );
  const setSort = useCallback((sort: ServiceSort) => setFilter((f) => ({ ...f, sort })), []);
  /** Menghapus semua filter (tab, kata kunci, filter lanjutan). Pilihan urutan tetap dipertahankan. */
  const clearFilters = useCallback(
    () => setFilter((f) => ({ ...INITIAL_FILTER, sort: f.sort })),
    []
  );

  return {
    filter,
    results,
    advancedActive: hasAdvancedFilters(filter),
    advancedCount: countAdvancedFilters(filter),
    anyFilterActive: hasActiveFilters(filter),
    setTab,
    setQuery,
    setAdvanced,
    setSort,
    clearFilters,
  };
}
