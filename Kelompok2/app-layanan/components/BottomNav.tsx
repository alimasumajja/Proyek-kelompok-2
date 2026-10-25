import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ITEMS: { name: string; label: string; icon: IconName; iconAktif: IconName }[] = [
  { name: 'index', label: 'Beranda', icon: 'home-outline', iconAktif: 'home' },
  { name: 'layanan', label: 'Layanan', icon: 'briefcase-outline', iconAktif: 'briefcase' },
  { name: 'tambah', label: 'Tambah', icon: 'add', iconAktif: 'add' },
  { name: 'laporan', label: 'Laporan', icon: 'stats-chart-outline', iconAktif: 'stats-chart' },
  { name: 'profil', label: 'Profil', icon: 'person-outline', iconAktif: 'person' },
];

export default function BottomNav({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Halaman detail dianggap bagian dari tab "Layanan"
  let aktif: string = state.routes[state.index].name;
  if (aktif.startsWith('detail')) aktif = 'layanan';

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {ITEMS.map((item) => {
        const fokus = aktif === item.name;
        const pergi = () => navigation.navigate(item.name);

        if (item.name === 'tambah') {
          return (
            <Pressable key={item.name} onPress={pergi} style={styles.item}>
              <View style={styles.fabWrap}>
                <View style={styles.fab}>
                  <Ionicons name="add" size={30} color={colors.white} />
                </View>
              </View>
              <Text style={[styles.label, styles.labelTambah]}>{item.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={item.name} onPress={pergi} style={styles.item}>
            <Ionicons
              name={fokus ? item.iconAktif : item.icon}
              size={22}
              color={fokus ? colors.primary : colors.muted}
            />
            <Text style={[styles.label, fokus && { color: colors.primary, fontWeight: '700' }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4, minHeight: 44 },
  label: { fontSize: 10, color: colors.muted },
  labelTambah: { color: colors.primary, fontWeight: '700' },
  fabWrap: { position: 'absolute', top: -34, alignItems: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
