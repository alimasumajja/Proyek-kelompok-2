import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText, IconButton } from '../atoms';

interface AppHeaderProps {
  title: string;
  /** Jika diisi, logo diganti tombol kembali (untuk halaman turunan seperti Detail). */
  onBack?: () => void;
  /** Satu aksi ikon di kanan (mis. menu ⋯ atau "+" pada layar yang tidak punya tombol Tambah di bottom nav). */
  action?: { icon: React.ComponentProps<typeof IconButton>['icon']; label: string; onPress: () => void };
  /** Aksi berupa teks di kanan (mis. "Tandai dibaca"). */
  textAction?: { label: string; onPress: () => void };
}

/**
 * App bar putih: [kiri: logo / kembali] [tengah: judul] [kanan: aksi opsional].
 *
 * Judul diposisikan mutlak di tengah baris, sehingga posisinya tidak bergantung pada lebar
 * elemen kiri/kanan (praktik terbaik: judul tetap di tengah walau aksi kanan ada, tidak ada,
 * berupa ikon, atau berupa teks). Ruang di kiri-kanan judul dicadangkan agar tidak bertabrakan.
 */
export function AppHeader({ title, onBack, action, textAction }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  // Cadangan lebar di sisi judul: aksi teks lebih lebar daripada ikon.
  const reserve = textAction ? 120 : 56;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) + 6 }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <IconButton
              icon="chevron-back"
              size={24}
              boxSize={36}
              onPress={onBack}
              accessibilityLabel="Kembali"
            />
          ) : (
            <View style={styles.logoBox} accessibilityElementsHidden>
              <AppText variant="title" color={NotaryColors.gold} style={styles.logoLetter}>
                N
              </AppText>
            </View>
          )}
        </View>

        <View style={[styles.titleLayer, { paddingHorizontal: reserve }]} pointerEvents="none">
          <AppText variant="title" numberOfLines={1} accessibilityRole="header">
            {title}
          </AppText>
        </View>

        <View style={[styles.side, styles.sideEnd]}>
          {textAction ? (
            <Pressable onPress={textAction.onPress} hitSlop={8} accessibilityRole="button">
              <AppText variant="bodyStrong" color={NotaryColors.emerald}>
                {textAction.label}
              </AppText>
            </Pressable>
          ) : action ? (
            <IconButton
              icon={action.icon}
              size={24}
              boxSize={36}
              onPress={action.onPress}
              accessibilityLabel={action.label}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
    backgroundColor: '#FFFFFF',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  side: { minWidth: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  sideEnd: { alignItems: 'flex-end' },
  titleLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NotaryColors.primary,
  },
  logoLetter: { fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
});
