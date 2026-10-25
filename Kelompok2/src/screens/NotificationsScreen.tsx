import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useServiceStore } from '@/context/service-store';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { EmptyState, NotificationRow } from '@/components/molecules';
import { AppHeader } from '@/components/organisms';

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenService: (serviceId: string) => void;
}

/** Halaman Notifikasi dalam aplikasi — PRD §6.10 (Figma: Beranda → lonceng). */
export function NotificationsScreen({ onBack, onOpenService }: NotificationsScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { notifications, markAllNotificationsRead } = useServiceStore();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Notifikasi"
        onBack={onBack}
        textAction={{ label: 'Tandai dibaca', onPress: markAllNotificationsRead }}
      />
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <EmptyState icon="notifications-off-outline" title="Belum ada notifikasi" />
        ) : (
          notifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={item.serviceId ? () => onOpenService(item.serviceId as string) : undefined}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
});
