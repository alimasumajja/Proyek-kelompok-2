import React from 'react';
import { useRouter } from 'expo-router';
import { LayananScreen, LayananTab } from '@/screens/LayananScreen';
import { ServiceItem } from '@/types/service';
import { Alert } from 'react-native';

export default function LayananRoute() {
  const router = useRouter();

  const handleAddNewService = () => {
    Alert.alert(
      'Tambah Berkas',
      'Formulir pendaftaran berkas baru (Nomor berkas, data klien, jenis layanan, penanggung jawab).'
    );
  };

  const handleFilterPress = () => {
    Alert.alert(
      'Filter Lanjutan',
      'Filter berdasarkan rentang tanggal, prioritas, atau staf penanggung jawab.'
    );
  };

  const handleSelectService = (service: ServiceItem) => {
    Alert.alert(
      service.code,
      `Klien: ${service.clientName}\nLayanan: ${service.serviceType}\nTahap: ${service.currentStage} (${service.progressPercent}%)\nPJ: ${service.assignedStaff.name}\nDeadline: ${service.dueDate}`
    );
  };

  return (
    <LayananScreen
      onAddNewService={handleAddNewService}
      onFilterPress={handleFilterPress}
      onSelectService={handleSelectService}
    />
  );
}
