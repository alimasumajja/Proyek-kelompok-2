import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle, type StatusBarStyle } from 'expo-status-bar';

/**
 * Mengatur warna ikon status bar hanya saat layar sedang fokus.
 * Penting pada tab: semua layar tab tetap ter-mount, sehingga komponen <StatusBar />
 * deklaratif di tiap layar akan saling menimpa.
 *   'light' = ikon putih (latar gelap) · 'dark' = ikon gelap (latar terang)
 */
export function useStatusBarStyle(style: StatusBarStyle) {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style);
    }, [style])
  );
}
