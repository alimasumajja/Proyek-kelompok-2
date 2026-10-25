import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { useProfileStore } from '@/context/profile-store';
import { useToast } from '@/context/toast';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { StaffMember } from '@/types/profile';
import { AppText, Button } from '@/components/atoms';
import { EmptyState, StaffRow } from '@/components/molecules';
import { AppHeader, StaffFormSheet } from '@/components/organisms';

interface StaffManagementScreenProps {
  onBack: () => void;
}

/**
 * Halaman Manajemen Staf — PRD §12: hanya Notaris yang dapat menambah, mengubah,
 * dan menonaktifkan staf. Bila dibuka oleh Staf (mis. lewat tautan langsung), tampil pesan akses.
 */
export function StaffManagementScreen({ onBack }: StaffManagementScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { account, staff, isUsernameTaken, addStaff, updateStaff, toggleStaffStatus } =
    useProfileStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);

  if (account.role !== 'Notaris') {
    return (
      <View style={styles.screen}>
        <AppHeader title="Manajemen Staf" onBack={onBack} />
        <EmptyState
          icon="lock-closed-outline"
          title="Hanya untuk Notaris"
          description="Pengelolaan staf hanya dapat dilakukan oleh pemilik kantor."
          actionLabel="Kembali"
          onActionPress={onBack}
        />
      </View>
    );
  }

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setFormOpen(true);
  };

  const activeCount = staff.filter((s) => s.status === 'Aktif').length;

  return (
    <View style={styles.screen}>
      <AppHeader title="Manajemen Staf" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <AppText variant="label" color={NotaryColors.textSecondary}>
            {staff.length} staf · {activeCount} aktif
          </AppText>
          <Button label="Tambah" icon="add" compact onPress={openAdd} />
        </View>

        {staff.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Belum ada staf"
            description="Tambahkan staf agar dapat menerima penugasan layanan."
            actionLabel="Tambah Staf"
            onActionPress={openAdd}
          />
        ) : (
          <View style={styles.list}>
            {staff.map((member, index) => (
              <StaffRow
                key={member.id}
                staff={member}
                onPress={openEdit}
                showDivider={index < staff.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <StaffFormSheet
        visible={formOpen}
        staff={editing}
        isUsernameTaken={isUsernameTaken}
        onClose={() => setFormOpen(false)}
        onSave={({ name, email, username, password }) => {
          if (editing) {
            updateStaff(editing.id, { name, email });
            showToast('Data staf diperbarui');
          } else {
            addStaff({ name, email, username, password });
            showToast('Staf baru ditambahkan');
          }
        }}
        onToggleStatus={(id) => {
          toggleStaffStatus(id);
          showToast('Status staf diperbarui');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { gap: 16, paddingHorizontal: 16, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
});
