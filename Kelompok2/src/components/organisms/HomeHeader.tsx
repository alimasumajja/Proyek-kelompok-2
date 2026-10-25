import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText, Avatar, IconButton } from '../atoms';

interface HomeHeaderProps {
  dateLabel: string;
  greeting: string;
  subtitle: string;
  userInitials: string;
  unreadCount: number;
  onNotificationPress: () => void;
  /** Avatar membuka tab Profil (sesuai Figma). */
  onAvatarPress?: () => void;
}

/** Header hijau tua halaman Beranda: tanggal, sapaan, avatar, dan tombol notifikasi. */
export function HomeHeader({
  dateLabel,
  greeting,
  subtitle,
  userInitials,
  unreadCount,
  onNotificationPress,
  onAvatarPress,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      <View style={styles.topRow}>
        <View style={styles.texts}>
          <AppText variant="eyebrow" color={NotaryColors.headerDateGold}>
            {dateLabel}
          </AppText>
          <AppText variant="display" color="#FFFFFF" accessibilityRole="header">
            {greeting}
          </AppText>
          <AppText variant="body" color={NotaryColors.headerSubtitleSage}>
            {subtitle}
          </AppText>
        </View>
        <Pressable
          onPress={onAvatarPress}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Buka profil">
          <Avatar initials={userInitials} size="lg" tone="light" />
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <IconButton
          icon="notifications-outline"
          color="#FFFFFF"
          shape="square"
          backgroundColor={NotaryColors.headerNotifBg}
          badgeCount={unreadCount}
          onPress={onNotificationPress}
          accessibilityLabel={
            unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: NotaryColors.primary,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  texts: { flex: 1, paddingRight: 16, gap: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 },
});
