import React, { useState } from 'react';
import { View, StyleSheet, Alert, Modal, Text, Pressable } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { LayananScreen, LayananTab } from '@/screens/LayananScreen';
import { CustomBottomNav, TabKey } from '@/components/CustomBottomNav';
import { NotaryColors } from '@/constants/notary-theme';
import { ServiceItem } from '@/types/service';
import { Ionicons } from '@expo/vector-icons';

export default function AppMainScreen() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [layananSubTab, setLayananSubTab] = useState<LayananTab>('Semua');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string }>({
    title: '',
    message: '',
  });

  // Handle navigation from Home summary cards or links into Layanan tab
  const handleNavigateToLayanan = (initialTab?: 'Semua' | 'Aktif' | 'Terlambat' | 'Selesai') => {
    if (initialTab) {
      setLayananSubTab(initialTab);
    }
    setCurrentTab('layanan');
  };

  const handleSelectService = (service: ServiceItem | string) => {
    if (typeof service === 'string') {
      Alert.alert(
        'Detail Layanan',
        `Membuka rincian berkas ID: ${service}. Fitur detail berkas dan monitoring tahapan progres.`
      );
    } else {
      Alert.alert(
        service.code,
        `Klien: ${service.clientName}\nLayanan: ${service.serviceType}\nTahap: ${service.currentStage} (${service.progressPercent}%)\nPJ: ${service.assignedStaff.name}\nDeadline: ${service.dueDate}`
      );
    }
  };

  const handleNotificationPress = () => {
    setModalContent({
      title: 'Notifikasi Kantor',
      message:
        '1. LAY-2026-0023: Melewati tenggat waktu (10 Mar 2026)\n2. LAY-2026-0022: Revisi draf perlu review notaris\n3. LAY-2026-0021: Dokumen KTP klien telah diunggah',
    });
    setModalVisible(true);
  };

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'tambah') {
      setModalContent({
        title: 'Tambah Berkas Baru',
        message:
          'Formulir pendaftaran berkas operasional notaris (Nomor berkas otomatis, data klien, jenis layanan/akta, penanggung jawab, dan tenggat waktu).',
      });
      setModalVisible(true);
      return;
    }

    if (tab === 'laporan') {
      setModalContent({
        title: 'Laporan & Repertorium',
        message:
          'Halaman Laporan Bulanan dan Repertorium Akta sedang dikembangkan oleh anggota tim lainnya.',
      });
      setModalVisible(true);
      return;
    }

    if (tab === 'profil') {
      setModalContent({
        title: 'Profil & Pengaturan',
        message:
          'Halaman Profil Kantor Notaris dan Manajemen Hak Akses Staf sedang dikembangkan oleh anggota tim lainnya.',
      });
      setModalVisible(true);
      return;
    }

    setCurrentTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Content View */}
      <View style={styles.content}>
        {currentTab === 'home' && (
          <HomeScreen
            onNavigateToLayanan={handleNavigateToLayanan}
            onSelectService={handleSelectService}
            onNotificationPress={handleNotificationPress}
          />
        )}

        {currentTab === 'layanan' && (
          <LayananScreen
            initialTab={layananSubTab}
            onAddNewService={() => handleTabPress('tambah')}
            onFilterPress={() => {
              setModalContent({
                title: 'Filter Lanjutan',
                message:
                  'Filter berkas berdasarkan: Rentang Tanggal, Tingkat Prioritas, Staf Penanggung Jawab, atau Keterlambatan.',
              });
              setModalVisible(true);
            }}
            onSelectService={handleSelectService}
          />
        )}
      </View>

      {/* Persistent Bottom Navigation matching Figma */}
      <CustomBottomNav activeTab={currentTab} onTabPress={handleTabPress} />

      {/* Info / Action Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBox}>
                <Ionicons name="information-circle-outline" size={24} color={NotaryColors.primary} />
              </View>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
            </View>

            <Text style={styles.modalMessage}>{modalContent.message}</Text>

            <Pressable
              style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressedButton]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NotaryColors.background,
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
    flex: 1,
  },
  modalMessage: {
    fontSize: 13.5,
    color: NotaryColors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: NotaryColors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  pressedButton: {
    opacity: 0.85,
  },
});
