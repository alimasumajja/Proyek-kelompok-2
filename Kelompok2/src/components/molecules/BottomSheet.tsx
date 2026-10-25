import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Judul teks biasa. Abaikan jika memakai `header` kustom. */
  title?: string;
  /** Pengganti judul (mis. nomor layanan + lencana status). */
  header?: React.ReactNode;
  /** Aksi di kanan header, default "Tutup". */
  headerAction?: { label: string; onPress: () => void };
  children: React.ReactNode;
}

/** Lembar bawah (modal sheet) generik: backdrop, handle, header, isi dapat di-scroll. */
export function BottomSheet({
  visible,
  onClose,
  title,
  header,
  headerAction,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const action = headerAction ?? { label: 'Tutup', onPress: onClose };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup lembar"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            {header ?? (
              <AppText variant="title" accessibilityRole="header">
                {title}
              </AppText>
            )}
            <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
              <AppText variant="bodyStrong" color="#265D4F">
                {action.label}
              </AppText>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  backdrop: { flex: 1 },
  sheet: {
    maxHeight: '85%',
    paddingHorizontal: 20,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    backgroundColor: NotaryColors.background,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
