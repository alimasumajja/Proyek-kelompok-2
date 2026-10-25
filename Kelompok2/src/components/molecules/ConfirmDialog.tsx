import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText, Button } from '../atoms';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  text: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dialog konfirmasi di tengah layar untuk aksi yang perlu dipastikan (mis. keluar dari akun). */
export function ConfirmDialog({
  visible,
  title,
  text,
  icon = 'log-out-outline',
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Tutup dialog"
        />
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={22} color={NotaryColors.danger} />
          </View>
          <AppText variant="title" style={styles.center} accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" color={NotaryColors.textSecondary} style={styles.center}>
            {text}
          </AppText>
          <View style={styles.actions}>
            <View style={styles.actionSlot}>
              <Button label={cancelLabel} variant="outline" onPress={onCancel} />
            </View>
            <View style={styles.actionSlot}>
              <Pressable
                onPress={onConfirm}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
                style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
                <AppText variant="heading" color="#FFFFFF">
                  {confirmLabel}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: Radius.xl,
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: NotaryColors.badgeDangerBg,
  },
  center: { textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, alignSelf: 'stretch' },
  actionSlot: { flex: 1 },
  danger: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: NotaryColors.danger,
  },
  pressed: { opacity: 0.88 },
});
