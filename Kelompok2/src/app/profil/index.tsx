import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfilHeader } from '@/components/profil/ProfilHeader';
import { RoleDemoCard, UserRole } from '@/components/profil/RoleDemoCard';
import { MenuItem } from '@/components/profil/MenuItem';
import { LogoutModal } from '@/components/profil/LogoutModal';
import { InformasiAkunSheet } from '@/components/profil/InformasiAkunSheet';
import { NotifikasiSheet } from '@/components/profil/NotifikasiSheet';
import { ToastNotification } from '@/components/profil/ToastNotification';
import { BottomTabBar } from '@/components/profil/BottomTabBar';
import {
  IconUser,
  IconUsers,
  IconBell,
  IconLogout,
} from '@/components/profil/icons';
import { NotarisColors } from '@/components/profil/theme';
import ManajemenStafScreen from './manajemen-staf';
import LoginScreen from './login';

export default function ProfilScreen() {
  const router = useRouter();

  // Active view: 'profil' | 'manajemen-staf' | 'login'
  const [currentView, setCurrentView] = useState<'profil' | 'manajemen-staf' | 'login'>('profil');

  // Role state: 'notaris' | 'staf'
  const [role, setRole] = useState<UserRole>('notaris');

  // User state per role
  const [notarisData, setNotarisData] = useState({
    nama: 'Nadia Larasati, S.H., M.Kn.',
    email: 'notaris@kantor.id',
    initials: 'NL',
  });

  const [stafData, setStafData] = useState({
    nama: 'Andi Pratama',
    email: 'andi@kantor.id',
    initials: 'AP',
  });

  // Modals state
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showNotifSheet, setShowNotifSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleSelectRole = (newRole: UserRole) => {
    if (newRole !== role) {
      setRole(newRole);
      triggerToast(
        newRole === 'notaris'
          ? 'Mode demo Notaris aktif'
          : 'Mode demo Staf aktif'
      );
    }
  };

  const handleSaveInfo = (newNama: string, newEmail: string) => {
    if (role === 'notaris') {
      setNotarisData((prev) => ({
        ...prev,
        nama: newNama,
        email: newEmail,
      }));
    } else {
      setStafData((prev) => ({
        ...prev,
        nama: newNama,
        email: newEmail,
      }));
    }
    triggerToast('Informasi akun berhasil diperbarui');
  };

  const handleSaveNotif = () => {
    triggerToast('Pengaturan notifikasi disimpan');
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setCurrentView('login');
  };

  const currentUser = role === 'notaris' ? notarisData : stafData;

  if (currentView === 'manajemen-staf') {
    return <ManajemenStafScreen onBack={() => setCurrentView('profil')} />;
  }

  if (currentView === 'login') {
    return <LoginScreen onLoginSuccess={() => setCurrentView('profil')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilHeader title="Profil" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{currentUser.initials}</Text>
          </View>

          <Text style={styles.userName}>{currentUser.nama}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>

          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>
              {role === 'notaris' ? 'Notaris' : 'Staf'}
            </Text>
          </View>
        </View>

        {/* Demo Mode Toggle */}
        <RoleDemoCard currentRole={role} onSelectRole={handleSelectRole} />

        {/* Section: Akun & Kantor */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>AKUN & KANTOR</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon={<IconUser size={19} color="#374151" />}
              title="Informasi Akun"
              subtitle="Nama, email, dan keamanan"
              onPress={() => setShowInfoSheet(true)}
              showDivider={role === 'notaris'}
            />

            {/* Menu Manajemen Staf: ONLY for Notaris */}
            {role === 'notaris' && (
              <MenuItem
                icon={<IconUsers size={19} color="#374151" />}
                title="Manajemen Staf"
                subtitle="3 akun aktif"
                onPress={() => setCurrentView('manajemen-staf')}
                showDivider={true}
              />
            )}

            <MenuItem
              icon={<IconBell size={19} color="#374151" />}
              title="Pengaturan Notifikasi"
              subtitle="Pengingat dan aktivitas"
              onPress={() => setShowNotifSheet(true)}
              showDivider={false}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
            ]}>
            <IconLogout size={18} color="#9C413D" />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </Pressable>
        </View>

        {/* Version Footer */}
        <Text style={styles.versionFooter}>NotarisAI · Versi prototipe 1.0</Text>
      </ScrollView>

      {/* Bottom Tabs */}
      <BottomTabBar />

      {/* Modals & Sheets */}
      <InformasiAkunSheet
        visible={showInfoSheet}
        initialNama={currentUser.nama}
        initialEmail={currentUser.email}
        onClose={() => setShowInfoSheet(false)}
        onSave={handleSaveInfo}
      />

      <NotifikasiSheet
        visible={showNotifSheet}
        onClose={() => setShowNotifSheet(false)}
        onSave={handleSaveNotif}
      />

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Floating Toast Notification */}
      <ToastNotification
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NotarisColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  userSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E5EFEA',
    borderWidth: 2,
    borderColor: '#D4E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: NotarisColors.primary,
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  badgeWrapper: {
    backgroundColor: NotarisColors.badgeNotarisBg,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: NotarisColors.badgeNotarisText,
  },
  menuSection: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  logoutWrapper: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDF8F7',
    borderWidth: 1,
    borderColor: '#F9DEDC',
    borderRadius: 14,
    paddingVertical: 13,
  },
  logoutText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#9C413D',
  },
  versionFooter: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});

