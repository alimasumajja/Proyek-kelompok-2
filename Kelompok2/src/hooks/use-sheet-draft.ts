import { useState } from 'react';

/**
 * Draf isian untuk bottom sheet: diisi ulang dari `initial` setiap kali sheet dibuka,
 * sehingga isian lama tidak tertinggal (tanpa setState di dalam useEffect).
 */
export function useSheetDraft<T>(visible: boolean, initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(initial);
  }

  return [draft, setDraft] as const;
}
