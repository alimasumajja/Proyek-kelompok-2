import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NotarisColors } from './theme';

interface InformasiAkunSheetProps {
  visible: boolean;
  initialNama: string;
  initialEmail: string;
  onClose: () => void;
  onSave: (nama: string, email: string) => void;
}

export function InformasiAkunSheet({
  visible,
  initialNama,
  initialEmail,
  onClose,
  onSave,
}: InformasiAkunSheetProps) {
  const [nama, setNama] = useState(initialNama);
  const [email, setEmail] = useState(initialEmail);

  // Isi ulang form dari props saat sheet dibuka / data akun berubah (tanpa setState di useEffect).
  const [prev, setPrev] = useState({ visible, initialNama, initialEmail });
  if (
    prev.visible !== visible ||
    prev.initialNama !== initialNama ||
    prev.initialEmail !== initialEmail
  ) {
    setPrev({ visible, initialNama, initialEmail });
    setNama(initialNama);
    setEmail(initialEmail);
  }

  const handleSave = () => {
    onSave(nama, email);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          {/* Top grabber */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Informasi Akun</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>Tutup</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={styles.input}
                value={nama}
                onChangeText={setNama}
                placeholder="Masukkan nama"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Masukkan email"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 44,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111827',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '600',
    color: NotarisColors.primary,
  },
  formContainer: {
    marginTop: 8,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: NotarisColors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});

