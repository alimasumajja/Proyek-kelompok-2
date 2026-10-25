import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FigmaTokens, NotaryColors, Radius } from '@/constants/notary-theme';
import { IconButton } from '../atoms';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  /** Tombol filter menyala (hijau) saat ada filter lanjutan yang aktif. */
  filterActive?: boolean;
}

/** Kolom pencarian + tombol filter (referensi Figma: search-row). */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Cari nomor, klien, atau jenis layanan',
  onFilterPress,
  filterActive = false,
}: SearchBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.input}>
        <Ionicons name="search-outline" size={18} color="#8A92A0" />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Cari layanan"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Hapus pencarian">
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>
      <IconButton
        icon={filterActive ? 'filter' : 'options-outline'}
        onPress={onFilterPress}
        accessibilityLabel="Filter layanan"
        boxSize={48}
        size={20}
        color={filterActive ? '#FFFFFF' : NotaryColors.textPrimary}
        backgroundColor={filterActive ? NotaryColors.primary : '#FFFFFF'}
        borderColor={filterActive ? NotaryColors.primary : '#E5E7EB'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FigmaTokens.fonts.regular,
    color: NotaryColors.textPrimary,
    paddingVertical: 0,
  },
});
