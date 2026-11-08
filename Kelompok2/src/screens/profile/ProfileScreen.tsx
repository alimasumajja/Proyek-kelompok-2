import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { useAuth } from '@/context/AuthContext';
import { useProfileStore } from '@/context/profile-store';
import { useServiceStore } from '@/context/service-store';
import { useToast } from '@/context/toast';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { AppText, Button } from '@/components/atoms';
import { ActionListItem, ConfirmDialog, StatTile } from '@/components/molecules';
import {
  AppHeader,
  NotificationSettingsSheet,
  ProfileSummaryCard,
} from '@/components/organisms';

interface ProfileScreenProps {
  /** Dipanggil setelah pengguna mengonfirmasi keluar; navigasi diatur oleh route. */
  onLogout: () => void;
  /** Buka halaman Manajemen Staf (hanya Notaris). */
  onOpenStaffManagement: () => void;
}

/**
 * Identitas dan peran mengikuti profil Supabase. Data staf serta preferensi notifikasi
 * masih menggunakan penyimpanan lokal sementara dan belum menjadi data backend.
 */
export function ProfileScreen({ onLogout, onOpenStaffManagement }: ProfileScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { services } = useServiceStore();
  const { staff, notificationPrefs, saveNotificationPrefs } = useProfileStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isOwner = user?.role === 'Notaris';

  const stats = useMemo(() => {
    const scope = isOwner
      ? services
      : services.filter((service) => service.assignedStaff.name === user?.name);
    return {
      ongoing: scope.filter((service) => service.status !== 'Selesai').length,
      late: scope.filter((service) => service.status === 'Terlambat').length,
      done: scope.filter((service) => service.status === 'Selesai').length,
    };
  }, [services, isOwner, user?.name]);

  const activeStaff = staff.filter((member) => member.status === 'Aktif');
  const summaryTiles: { label: string; value: number; tone?: 'danger' | 'success' }[] = [
    { label: isOwner ? 'Berjalan' : 'Ditangani', value: stats.ongoing },
    { label: 'Terlambat', value: stats.late, tone: stats.late > 0 ? 'danger' : undefined },
    { label: 'Selesai', value: stats.done, tone: 'success' },
    ...(isOwner ? [{ label: 'Staf aktif', value: activeStaff.length }] : []),
  ];

  if (!user) return null;

  return (
    <View style={styles.screen}>
      <AppHeader title="Profil" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}>
        <ProfileSummaryCard account={user} />

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

        <Button
          label="Keluar"
          icon="log-out-outline"
          variant="outline"
          onPress={() => setLogoutOpen(true)}
        />
      </ScrollView>

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
