import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import type { UserAccount } from '@/types/profile';
import { AppText, Avatar } from '../atoms';

interface AccountDemoCardProps {
  /** Akun aktif yang dapat dipilih (akun nonaktif tidak ditampilkan). */
  accounts: UserAccount[];
  currentId: string;
  onSelect: (id: string) => void;
}

/**
 * Mode Demo: berpindah akun (Notaris/Staf) tanpa kata sandi untuk memeriksa tampilan
 * dan pembatasan akses tiap peran. Setelah login terhubung, akun mengikuti hasil login.
 */
export function AccountDemoCard({ accounts, currentId, onSelect }: AccountDemoCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.list}>
        {accounts.map((item) => {
          const selected = item.id === currentId;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              accessibilityRole="radio"
              accessibilityLabel={`${item.name}, ${item.role}`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}>
              <Avatar initials={item.initials} size="md" tone={selected ? 'solid' : 'soft'} />
              <View style={styles.texts}>
                <AppText variant="heading">{item.name}</AppText>
                <AppText variant="caption" color={NotaryColors.textSecondary}>
                  {item.role} · @{item.username}
                </AppText>
              </View>
              {selected ? (
                <Ionicons name="checkmark-circle" size={20} color={NotaryColors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <AppText variant="caption" color={NotaryColors.textMuted}>
        Pembatasan antarmuka ini juga harus diterapkan kembali pada backend dan database produksi.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: { borderColor: NotaryColors.primary, backgroundColor: NotaryColors.segmentBg },
  pressed: { opacity: 0.88 },
  texts: { flex: 1, gap: 2 },
});
