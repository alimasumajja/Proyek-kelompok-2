import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useToast } from '@/context/toast';
import {
  EditStafSheet,
  IconBell,
  IconLogout,
  IconPlus,
  IconUser,
  IconUsers,
  InformasiAkunSheet,
  LogoutModal,
  MenuItem,
  NotarisColors,
  NotifikasiSheet,
  ProfilHeader,
  RoleDemoCard,
  TambahStafSheet,
} from '@/components/profil';
import type { StaffData, UserRole } from '@/components/profil';

/**
 * Route Profil — Tab 5 dari Bottom Navigation (PRD §4.1 dan §12 Hak Akses).
 * Merakit komponen di `components/profil`: informasi akun, mode demo peran,
 * manajemen staf (hanya Notaris), pengaturan notifikasi, dan keluar.
 * Bottom navigation disediakan oleh `(tabs)/_layout.tsx`, bukan di layar ini.
 */

const INITIAL_STAFF: StaffData[] = [
  { id: 's1', nama: 'Rani Putri', email: 'rani.putri@kantor.id', initials: 'RP', status: 'Aktif', peran: 'Staf' },
  { id: 's2', nama: 'Bagas Pratama', email: 'bagas.pratama@kantor.id', initials: 'BP', status: 'Aktif', peran: 'Staf' },
  { id: 's3', nama: 'Dewi Anjani', email: 'dewi.anjani@kantor.id', initials: 'DA', status: 'Nonaktif', peran: 'Staf' },
];

function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

export default function ProfilTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState<UserRole>('notaris');
  const [nama, setNama] = useState('Nadia Larasati');
  const [email, setEmail] = useState('nadia.larasati@kantor.id');
  const [staff, setStaff] = useState<StaffData[]>(INITIAL_STAFF);
  const [staffOpen, setStaffOpen] = useState(false);

  const [akunVisible, setAkunVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [tambahVisible, setTambahVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [editing, setEditing] = useState<StaffData | null>(null);

  const isNotaris = role === 'notaris';

  const handleSaveAkun = (newNama: string, newEmail: string) => {
    if (!newNama.trim() || !newEmail.trim()) return;
    setNama(newNama.trim());
    setEmail(newEmail.trim());
    showToast('Informasi akun diperbarui');
  };

  const handleTambahStaf = (newNama: string, newEmail: string, peran: string) => {
    setStaff((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        nama: newNama.trim(),
        email: newEmail.trim(),
        initials: getInitials(newNama),
        status: 'Aktif',
        peran,
      },
    ]);
    showToast('Staf baru ditambahkan');
  };

  const handleEditStaf = (id: string, newNama: string, newEmail: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, nama: newNama.trim(), email: newEmail.trim(), initials: getInitials(newNama) } : s
      )
    );
    showToast('Data staf diperbarui');
  };

  const handleToggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : s))
    );
    showToast('Status staf diperbarui');
  };

  const handleConfirmLogout = () => {
    setLogoutVisible(false);
    router.replace('/screenawal');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: '#FFFFFF' }}>
        <ProfilHeader title="Profil" />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}>
        {/* Kartu profil */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(nama)}</Text>
          </View>
          <Text style={styles.profileName}>{nama}</Text>
          <Text style={styles.profileRole}>{isNotaris ? 'Notaris' : 'Staf Kantor'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <View style={isNotaris ? styles.badgeNotaris : styles.badgeStaf}>
            <Text style={isNotaris ? styles.badgeNotarisText : styles.badgeStafText}>
              {isNotaris ? 'Akses Penuh' : 'Akses Operasional'}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionLabel}>PENGATURAN</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={<IconUser size={20} />}
            title="Informasi Akun"
            subtitle="Nama dan email akun"
            onPress={() => setAkunVisible(true)}
          />
          {isNotaris && (
            <MenuItem
              icon={<IconUsers size={20} />}
              title="Manajemen Staf"
              subtitle={`${staff.length} staf terdaftar`}
              onPress={() => setStaffOpen((open) => !open)}
            />
          )}
          <MenuItem
            icon={<IconBell size={20} />}
            title="Notifikasi"
            subtitle="Pengaturan pemberitahuan"
            onPress={() => setNotifVisible(true)}
            showDivider={false}
          />
        </View>

        {/* Daftar staf (hanya Notaris) */}
        {isNotaris && staffOpen && (
          <View style={styles.staffSection}>
            <View style={styles.staffHeaderRow}>
              <Text style={styles.sectionLabelInline}>DAFTAR STAF</Text>
              <Pressable
                onPress={() => setTambahVisible(true)}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Tambah staf">
                <IconPlus size={14} />
                <Text style={styles.addButtonText}>Tambah</Text>
              </Pressable>
            </View>
            <View style={styles.menuCard}>
              {staff.map((s, index) => {
                const aktif = s.status === 'Aktif';
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setEditing(s)}
                    style={({ pressed }) => [
                      styles.staffRow,
                      index < staff.length - 1 && styles.staffRowBorder,
                      pressed && styles.staffRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Ubah ${s.nama}`}>
                    <View style={styles.staffAvatar}>
                      <Text style={styles.staffAvatarText}>{s.initials}</Text>
                    </View>
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{s.nama}</Text>
                      <Text style={styles.staffEmail}>{s.email}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: aktif ? NotarisColors.badgeActiveBg : NotarisColors.badgeInactiveBg,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: aktif ? NotarisColors.badgeActiveText : NotarisColors.badgeInactiveText },
                        ]}>
                        {s.status}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Mode demo peran */}
        <RoleDemoCard
          currentRole={role}
          onSelectRole={(next) => {
            setRole(next);
            if (next === 'staf') setStaffOpen(false);
          }}
        />

        {/* Keluar */}
        <Pressable
          onPress={() => setLogoutVisible(true)}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari aplikasi">
          <IconLogout size={18} />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </ScrollView>

      <InformasiAkunSheet
        visible={akunVisible}
        initialNama={nama}
        initialEmail={email}
        onClose={() => setAkunVisible(false)}
        onSave={handleSaveAkun}
      />
      <NotifikasiSheet
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        onSave={() => showToast('Pengaturan notifikasi disimpan')}
      />
      <TambahStafSheet
        visible={tambahVisible}
        onClose={() => setTambahVisible(false)}
        onSave={handleTambahStaf}
      />
      <EditStafSheet
        visible={editing !== null}
        staff={editing}
        onClose={() => setEditing(null)}
        onSave={handleEditStaf}
        onToggleStatus={handleToggleStatus}
      />
      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NotarisColors.background },
  content: { paddingTop: 16 },
  pressed: { opacity: 0.8 },

  profileCard: {
    backgroundColor: NotarisColors.cardBg,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NotarisColors.borderCard,
    marginBottom: 22,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NotarisColors.cardSelected,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: NotarisColors.primary },
  profileName: { fontSize: 20, fontWeight: '700', color: NotarisColors.text, marginBottom: 4 },
  profileRole: { fontSize: 13.5, fontWeight: '500', color: NotarisColors.textSecondary, marginBottom: 4 },
  profileEmail: { fontSize: 12.5, color: NotarisColors.textMuted, marginBottom: 12 },
  badgeNotaris: {
    backgroundColor: NotarisColors.badgeNotarisBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeNotarisText: { fontSize: 12, fontWeight: '600', color: NotarisColors.badgeNotarisText },
  badgeStaf: {
    backgroundColor: NotarisColors.cardSelected,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeStafText: { fontSize: 12, fontWeight: '600', color: NotarisColors.primary },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: NotarisColors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionLabelInline: {
    fontSize: 11,
    fontWeight: '700',
    color: NotarisColors.textSecondary,
    letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: NotarisColors.cardBg,
    borderRadius: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: NotarisColors.borderCard,
    overflow: 'hidden',
  },

  staffSection: { marginTop: 20 },
  staffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NotarisColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addButtonText: { fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  staffRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  staffRowPressed: { backgroundColor: '#F9FAFB' },
  staffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NotarisColors.cardSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: { fontSize: 13, fontWeight: '700', color: NotarisColors.primary },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: '600', color: NotarisColors.text, marginBottom: 2 },
  staffEmail: { fontSize: 11.5, color: NotarisColors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: NotarisColors.dangerBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: NotarisColors.dangerBorder,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: NotarisColors.danger },
});
