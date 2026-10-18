import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { IconCheck } from './icons';
import { NotarisColors } from './theme';

interface NotifikasiSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function NotifikasiSheet({ visible, onClose, onSave }: NotifikasiSheetProps) {
  const [targetMendekat, setTargetMendekat] = useState(true);
  const [kendalaBaru, setKendalaBaru] = useState(true);
  const [layananTanpaPembaruan, setLayananTanpaPembaruan] = useState(true);

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Top grabber */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Pengaturan Notifikasi</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>Tutup</Text>
            </Pressable>
          </View>

          {/* Checkbox List */}
          <View style={styles.listContainer}>
            {/* Item 1 */}
            <Pressable
              onPress={() => setTargetMendekat(!targetMendekat)}
              style={styles.checkItem}>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Target mendekat</Text>
                <Text style={styles.itemSubtitle}>Pengingat sebelum tenggat</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  targetMendekat ? styles.checkboxChecked : styles.checkboxUnchecked,
                ]}>
                {targetMendekat && <IconCheck size={12} color="#FFFFFF" />}
              </View>
            </Pressable>

            {/* Item 2 */}
            <Pressable
              onPress={() => setKendalaBaru(!kendalaBaru)}
              style={styles.checkItem}>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Kendala baru</Text>
                <Text style={styles.itemSubtitle}>Catatan kendala dan instruksi</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  kendalaBaru ? styles.checkboxChecked : styles.checkboxUnchecked,
                ]}>
                {kendalaBaru && <IconCheck size={12} color="#FFFFFF" />}
              </View>
            </Pressable>

            {/* Item 3 */}
            <Pressable
              onPress={() => setLayananTanpaPembaruan(!layananTanpaPembaruan)}
              style={[styles.checkItem, styles.lastItem]}>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Layanan tanpa pembaruan</Text>
                <Text style={styles.itemSubtitle}>Ambang demo: 3 hari</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  layananTanpaPembaruan ? styles.checkboxChecked : styles.checkboxUnchecked,
                ]}>
                {layananTanpaPembaruan && <IconCheck size={12} color="#FFFFFF" />}
              </View>
            </Pressable>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
          </Pressable>
        </View>
      </View>
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
    paddingBottom: 14,
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
  listContainer: {
    marginTop: 6,
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: NotarisColors.primary,
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: NotarisColors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
