import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FigmaTokens, NotaryColors, Shadow } from '@/constants/notary-theme';
import { AppText } from '../atoms';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Props yang diberikan Expo Router ke `tabBar` custom (diturunkan dari tipe `Tabs`). */
export type BottomNavBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

interface TabConfig {
  label: string;
  icon: IconName;
  iconActive: IconName;
  /** Tombol aksi utama di tengah (Tambah Layanan) — ditampilkan menonjol. */
  primary?: boolean;
}

/** Urutan & tampilan menu sesuai PRD §10 (Struktur Navigasi). Kunci = nama file di (tabs). */
const TABS: Record<string, TabConfig> = {
  index: { label: 'Beranda', icon: 'home-outline', iconActive: 'home' },
  layanan: { label: 'Layanan', icon: 'briefcase-outline', iconActive: 'briefcase' },
  tambah: { label: 'Tambah', icon: 'add', iconActive: 'add', primary: true },
  laporan: { label: 'Laporan', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  profil: { label: 'Profil', icon: 'person-outline', iconActive: 'person' },
};

/** Bottom navigation kustom: 5 menu dengan tombol "Tambah" menonjol di tengah. */
export function BottomNavBar({ state, emitter, navigateToTab }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8) + 4;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null; // rute lain tidak ditampilkan di bar

        const focused = state.index === index;

        const onPress = () => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };

        const onLongPress = () => emitter.emit({ type: 'tabLongPress', target: route.key });

        if (config.primary) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityLabel="Tambah layanan baru"
              accessibilityState={{ selected: focused }}
              style={styles.primaryWrapper}>
              {({ pressed }) => (
                <>
                  <View style={[styles.primaryButton, pressed && styles.primaryPressed]}>
                    <Ionicons name={config.icon} size={26} color="#FFFFFF" />
                  </View>
                  <AppText
                    variant="micro"
                    color={focused ? NotaryColors.tabActive : NotaryColors.tabInactive}
                    style={styles.primaryLabel}>
                    {config.label}
                  </AppText>
                </>
              )}
            </Pressable>
          );
        }

        const color = focused ? NotaryColors.tabActive : NotaryColors.tabInactive;
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityLabel={config.label}
            accessibilityState={{ selected: focused }}
            style={styles.tab}>
            <Ionicons name={focused ? config.iconActive : config.icon} size={22} color={color} />
            <AppText variant="micro" color={color} style={focused ? styles.activeLabel : undefined}>
              {config.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    backgroundColor: '#FFFFFF',
    ...Shadow.bar,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  activeLabel: { fontFamily: FigmaTokens.fonts.bold },
  primaryWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -26 },
  primaryButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NotaryColors.primary,
    shadowColor: NotaryColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryPressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
  primaryLabel: { marginTop: 4 },
});
