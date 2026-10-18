import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  IconBack,
  IconPlus,
  IconSearch,
  IconDots,
} from '@/components/profil/icons';
import { TambahStafSheet } from '@/components/profil/TambahStafSheet';
import { EditStafSheet, StaffData } from '@/components/profil/EditStafSheet';
import { ToastNotification } from '@/components/profil/ToastNotification';
import { NotarisColors } from '@/components/profil/theme';

interface ManajemenStafScreenProps {
  onBack?: () => void;
}

export default function ManajemenStafScreen({ onBack }: ManajemenStafScreenProps = {}) {
  const router = useRouter();

  // Initial staff list matching Figma frames
  const [staffList, setStaffList] = useState<StaffData[]>([
    {
      id: '1',
      nama: 'Andi Pratama',
      email: 'andi@kantor.id',
      initials: 'AP',
      status: 'Aktif',
    },
    {
      id: '2',
      nama: 'Rina Amelia',
      email: 'rina@kantor.id',
      initials: 'RA',
      status: 'Aktif',
    },
    {
      id: '3',
      nama: 'Fajar Nugroho',
      email: 'fajar@kantor.id',
      initials: 'FN',
      status: 'Nonaktif',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [staffList, searchQuery]);

  // Add staff handler
  const handleAddStaff = (nama: string, email: string, peran: string) => {
    const initials = nama
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newStaff: StaffData = {
      id: Date.now().toString(),
      nama,
      email,
      initials,
      status: 'Aktif',
      peran,
    };

    setStaffList((prev) => [...prev, newStaff]);
    triggerToast('Akun staf berhasil disimpan');
  };

  // Save edit staff handler
  const handleSaveStaff = (id: string, nama: string, email: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nama, email } : s))
    );
    triggerToast('Akun staf berhasil disimpan');
  };

  // Toggle status handler
  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
          if (nextStatus === 'Nonaktif') {
            triggerToast('Akun dinonaktifkan');
          } else {
            triggerToast('Akun diaktifkan');
          }
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (onBack ? onBack() : router.back())}
          hitSlop={12}
          style={styles.backButton}>
          <IconBack size={20} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Manajemen Staf</Text>

        <Pressable
          onPress={() => setShowAddSheet(true)}
          hitSlop={12}
          style={styles.addButton}>
          <IconPlus size={20} color="#111827" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <IconSearch size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau email staf"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Staff Cards List */}
        <View style={styles.listWrapper}>
          {filteredStaff.map((staff) => (
            <View key={staff.id} style={styles.staffCard}>
              {/* Initials Circle */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{staff.initials}</Text>
              </View>

              {/* Staff Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.staffName}>{staff.nama}</Text>
                <Text style={styles.staffEmail}>{staff.email}</Text>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    staff.status === 'Aktif'
                      ? styles.badgeAktif
                      : styles.badgeNonaktif,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      staff.status === 'Aktif'
                        ? styles.statusTextAktif
                        : styles.statusTextNonaktif,
                    ]}>
                    {staff.status}
                  </Text>
                </View>
              </View>

              {/* Action Button (...) */}
              <Pressable
                onPress={() => setEditingStaff(staff)}
                hitSlop={12}
                style={styles.actionDots}>
                <IconDots size={20} color="#6B7280" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sheets & Modals */}
      <TambahStafSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSave={handleAddStaff}
      />

      <EditStafSheet
        visible={!!editingStaff}
        staff={editingStaff}
        onClose={() => setEditingStaff(null)}
        onSave={handleSaveStaff}
        onToggleStatus={handleToggleStatus}
      />

      {/* Toast Notification */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0EC',
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 32,
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#111827',
  },
  listWrapper: {
    gap: 12,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5EFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: NotarisColors.primary,
  },
  detailsContainer: {
    flex: 1,
  },
  staffName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAktif: {
    backgroundColor: '#E6F4EA',
  },
  badgeNonaktif: {
    backgroundColor: '#F1F3F4',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextAktif: {
    color: '#137333',
  },
  statusTextNonaktif: {
    color: '#5F6368',
  },
  actionDots: {
    padding: 6,
  },
});

