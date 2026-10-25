import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';

/**
 * Route Profil — Tab 5 dari Bottom Navigation.
 * Placeholder untuk tim. Sesuai PRD §4.1 dan §12 Hak Akses.
 */
export default function ProfilTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuItems = [
    { icon: 'people-outline', label: 'Manajemen Staf', desc: 'Kelola akun staf kantor' },
    { icon: 'shield-checkmark-outline', label: 'Hak Akses', desc: 'Atur izin setiap pengguna' },
    { icon: 'notifications-outline', label: 'Notifikasi', desc: 'Pengaturan pemberitahuan' },
    { icon: 'help-circle-outline', label: 'Bantuan', desc: 'Panduan penggunaan aplikasi' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) + 6 }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarInitials}>NL</Text>
          </View>
          <Text style={styles.profileName}>Nadia Larasati</Text>
          <Text style={styles.profileRole}>Notaris</Text>
          <Text style={styles.profileEmail}>nadia.larasati@kantor.id</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#1B5248" />
            <Text style={styles.roleBadgeText}>Akses Penuh</Text>
          </View>
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionLabel}>PENGATURAN</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => { }}
              accessibilityRole="button"
              accessibilityLabel={item.label}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={NotaryColors.primary} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C0C7CE" />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
          onPress={() => router.replace('/screenawal')}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari aplikasi">
          <Ionicons name="log-out-outline" size={18} color="#C0392B" />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NotaryColors.background },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: NotaryColors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoLetter: { color: '#D4AF37', fontSize: 18, fontWeight: '700', fontFamily: 'serif' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: NotaryColors.textPrimary },
  headerPlaceholder: { width: 36 },
  content: { padding: 16, alignItems: 'center' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 22,
  },
  avatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D1DDD8',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3, borderColor: '#EEF4F1',
  },
  avatarInitials: { fontSize: 24, fontWeight: '700', color: '#264D43' },
  profileName: { fontSize: 20, fontWeight: '700', color: NotaryColors.textPrimary, marginBottom: 4 },
  profileRole: { fontSize: 13.5, color: NotaryColors.textSecondary, fontWeight: '500', marginBottom: 4 },
  profileEmail: { fontSize: 12.5, color: NotaryColors.textMuted, marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EEF4F1',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#1B5248' },
  sectionLabel: {
    fontSize: 10.5, fontWeight: '700',
    color: NotaryColors.textSecondary,
    letterSpacing: 0.8, marginBottom: 10,
    alignSelf: 'flex-start',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18, width: '100%',
    borderWidth: 1, borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 22,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 15, gap: 14,
  },
  menuItemPressed: { backgroundColor: '#F7F9F8' },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F4' },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEF4F1',
    justifyContent: 'center', alignItems: 'center',
  },
  menuTexts: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: NotaryColors.textPrimary, marginBottom: 2 },
  menuDesc: { fontSize: 12, color: NotaryColors.textSecondary },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '100%', justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1, borderColor: '#FDDADA',
  },
  logoutPressed: { opacity: 0.8 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#C0392B' },
});
