import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { useProfileStore } from '@/context/profile-store';
import { useServiceStore } from '@/context/service-store';
import { useToast } from '@/context/toast';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { AppText, Button } from '@/components/atoms';
import { ActionListItem, ConfirmDialog, StatTile } from '@/components/molecules';
import {
  AccountDemoCard,
  AccountInfoSheet,
  AppHeader,
  NotificationSettingsSheet,
  ProfileSummaryCard,
} from '@/components/organisms';

interface ProfileScreenProps {
  /** Dipanggil setelah pengguna mengonfirmasi keluar (navigasi diatur oleh route). */
  onLogout: () => void;
  /** Buka halaman Manajemen Staf (hanya Notaris). */
  onOpenStaffManagement: () => void;
}

/**
 * Halaman Profil — PRD §4.1 dan §12 (Hak Akses). Tampilan mengikuti akun yang masuk:
 *  - Notaris (pemilik): ringkasan kantor + Manajemen Staf.
 *  - Staf: ringkasan tugas milik sendiri, tanpa Manajemen Staf.
 * Akun & staf dari profile-store; data layanan dari service-store.
 */
export function ProfileScreen({ onLogout, onOpenStaffManagement }: ProfileScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { services } = useServiceStore();
  const {
    account,
    accounts,
    staff,
    notificationPrefs,
    switchAccount,
    signOut,
    updateAccount,
    saveNotificationPrefs,
  } = useProfileStore();

  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isOwner = account.role === 'Notaris';

  const stats = useMemo(() => {
    const scope = isOwner ? services : services.filter((s) => s.assignedStaff.name === account.name);
    return {
      total: scope.length,
      ongoing: scope.filter((s) => s.status !== 'Selesai').length,
      late: scope.filter((s) => s.status === 'Terlambat').length,
      done: scope.filter((s) => s.status === 'Selesai').length,
    };
  }, [services, isOwner, account.name]);

  const activeStaff = staff.filter((s) => s.status === 'Aktif').length;
  const demoAccounts = accounts.filter((a) => a.status === 'Aktif');

  const summaryTiles: { label: string; value: number; tone?: 'danger' | 'success' }[] = [
    { label: isOwner ? 'Berjalan' : 'Ditangani', value: stats.ongoing },
    { label: 'Terlambat', value: stats.late, tone: stats.late > 0 ? 'danger' : undefined },
    { label: 'Selesai', value: stats.done, tone: 'success' },
    ...(isOwner ? [{ label: 'Staf aktif', value: activeStaff }] : []),
  ];

  return (
    <View style={styles.screen}>
      <AppHeader title="Profil" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}>
        <ProfileSummaryCard account={account} />

        <View style={styles.section}>
          <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
            {isOwner ? 'RINGKASAN KANTOR' : 'TUGAS SAYA'}
          </AppText>
          <View style={styles.statsCard}>
            {summaryTiles.map((tile, index) => (
              <React.Fragment key={tile.label}>
                {index > 0 ? <View style={styles.statDivider} /> : null}
                <StatTile label={tile.label} value={tile.value} tone={tile.tone} />
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
            PENGATURAN
          </AppText>
          <ActionListItem
            icon="person-outline"
            title="Informasi Akun"
            description="Nama dan email akun"
            onPress={() => setAccountOpen(true)}
          />
          {isOwner ? (
            <ActionListItem
              icon="people-outline"
              title="Manajemen Staf"
              description={`${staff.length} staf terdaftar`}
              onPress={onOpenStaffManagement}
            />
          ) : null}
          <ActionListItem
            icon="notifications-outline"
            title="Notifikasi"
            description="Pengaturan pemberitahuan"
            onPress={() => setNotifOpen(true)}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
            MODE DEMO · MASUK SEBAGAI
          </AppText>
          <AccountDemoCard
            accounts={demoAccounts}
            currentId={account.id}
            onSelect={(id) => {
              switchAccount(id);
              showToast('Akun demo diganti');
            }}
          />
        </View>

        <Button
          label="Keluar"
          icon="log-out-outline"
          variant="outline"
          onPress={() => setLogoutOpen(true)}
        />
      </ScrollView>

      <AccountInfoSheet
        visible={accountOpen}
        account={account}
        onClose={() => setAccountOpen(false)}
        onSave={(next) => {
          updateAccount(next);
          showToast('Informasi akun diperbarui');
        }}
      />
      <NotificationSettingsSheet
        visible={notifOpen}
        prefs={notificationPrefs}
        onClose={() => setNotifOpen(false)}
        onSave={(next) => {
          saveNotificationPrefs(next);
          showToast('Pengaturan notifikasi disimpan');
        }}
      />
      <ConfirmDialog
        visible={logoutOpen}
        title="Keluar dari akun?"
        text="Anda perlu masuk kembali untuk mengakses layanan kantor."
        confirmLabel="Ya, Keluar"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          signOut();
          onLogout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { gap: 20, paddingHorizontal: 16, paddingTop: 16 },
  section: { gap: 10 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  statDivider: { width: 1, height: 32, backgroundColor: NotaryColors.borderLight },
});
