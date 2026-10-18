import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  IconHome,
  IconBriefcase,
  IconPlus,
  IconChart,
  IconUser,
} from './icons';
import { NotarisColors } from './theme';

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isProfilActive = pathname.startsWith('/profil');

  return (
    <View style={styles.tabContainer}>
      {/* 1. Beranda */}
      <Pressable
        onPress={() => router.push('/')}
        style={styles.tabItem}>
        <IconHome size={22} color="#9CA3AF" />
        <Text style={styles.tabLabelInactive}>Beranda</Text>
      </Pressable>

      {/* 2. Layanan */}
      <Pressable style={styles.tabItem}>
        <IconBriefcase size={22} color="#9CA3AF" />
        <Text style={styles.tabLabelInactive}>Layanan</Text>
      </Pressable>

      {/* 3. Tambah (Elevated Center Button) */}
      <View style={styles.centerButtonWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.centerButton,
            pressed && styles.centerButtonPressed,
          ]}>
          <IconPlus size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.centerButtonLabel}>Tambah</Text>
      </View>

      {/* 4. Laporan */}
      <Pressable style={styles.tabItem}>
        <IconChart size={22} color="#9CA3AF" />
        <Text style={styles.tabLabelInactive}>Laporan</Text>
      </Pressable>

      {/* 5. Profil */}
      <Pressable
        onPress={() => router.push('/profil')}
        style={styles.tabItem}>
        <IconUser
          size={22}
          color={isProfilActive ? NotarisColors.primary : '#9CA3AF'}
        />
        <Text
          style={
            isProfilActive ? styles.tabLabelActive : styles.tabLabelInactive
          }>
          Profil
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    height: Platform.OS === 'ios' ? 84 : 68,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabelInactive: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: NotarisColors.primary,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: NotarisColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  centerButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  centerButtonLabel: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
});
