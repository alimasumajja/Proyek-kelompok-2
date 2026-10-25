import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText, IconButton } from '../atoms';

interface AppHeaderProps {
  title: string;
  /** Jika diisi, logo diganti tombol kembali (untuk halaman turunan seperti Detail). */
  onBack?: () => void;
  /** Aksi di kanan (mis. tombol "+" di halaman Layanan). */
  /** Aksi berupa teks di kanan (mis. "Tandai dibaca"). */
  textAction?: { label: string; onPress: () => void };
  action?: { icon: React.ComponentProps<typeof IconButton>['icon']; label: string; onPress: () => void };
}

/** App bar putih: logo "N" di kiri, judul di tengah, aksi opsional di kanan. */
export function AppHeader({ title, onBack, action, textAction }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) + 6 }]}>
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
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.actionSlot, textAction && styles.textSlot]}>
        {textAction ? (
          <Pressable onPress={textAction.onPress} hitSlop={8} accessibilityRole="button">
            <AppText variant="bodyStrong" color={NotaryColors.emerald}>
              {textAction.label}
            </AppText>
          </Pressable>
        ) : action ? (
          <IconButton
            icon={action.icon}
            size={26}
            boxSize={36}
            onPress={action.onPress}
            accessibilityLabel={action.label}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
    backgroundColor: '#FFFFFF',
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
  actionSlot: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  textSlot: { width: undefined, minWidth: 36, alignItems: 'flex-end' },
});
