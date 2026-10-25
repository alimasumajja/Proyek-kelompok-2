import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FigmaTokens, NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Jika diisi, chip tampil sebagai chip aktif yang bisa dihapus (ikon ×). */
  onRemove?: () => void;
}

export function Chip({ label, selected = false, onPress, onRemove }: ChipProps) {
  const removable = !!onRemove;
  return (
    <Pressable
      onPress={removable ? onRemove : onPress}
      accessibilityRole={removable ? 'button' : 'radio'}
      accessibilityState={removable ? undefined : { selected }}
      accessibilityLabel={removable ? `Hapus filter ${label}` : label}
      style={[
        styles.base,
        removable ? styles.removable : selected ? styles.selected : styles.idle,
      ]}>
      <AppText
        variant="label"
        color={removable ? NotaryColors.primary : selected ? '#FFFFFF' : NotaryColors.textPrimary}
        style={selected && !removable ? styles.selectedText : undefined}>
        {label}
      </AppText>
      {removable ? <Ionicons name="close" size={14} color={NotaryColors.primary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  idle: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  selected: { backgroundColor: NotaryColors.primary, borderColor: NotaryColors.primary },
  selectedText: { fontFamily: FigmaTokens.fonts.bold },
  removable: {
    backgroundColor: NotaryColors.badgeInfoBg,
    borderColor: '#C8DBD3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
});
