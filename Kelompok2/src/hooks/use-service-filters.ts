import { useCallback, useMemo, useState } from 'react';
import type { FilterState, ServiceItem, ServiceTab } from '@/types/service';
import { filterServices, hasAdvancedFilters, INITIAL_FILTER } from '@/utils/service';

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
  const toggleSort = useCallback(
    () => setFilter((f) => ({ ...f, sortByPriority: !f.sortByPriority })),
    []
  );
  const reset = useCallback(() => setFilter(INITIAL_FILTER), []);

  return {
    filter,
    results,
    advancedActive: hasAdvancedFilters(filter),
    setTab,
    setQuery,
    setAdvanced,
    toggleSort,
    reset,
  };
}
