import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import {
  currentUserData,
  nearestDeadlineData,
  operationalSummaryData,
  recentActivitiesData,
  todayLabel,
} from '@/data/dummy';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceItem, ServiceTab } from '@/types/service';
import { getPriorityServices } from '@/utils/service';
import { DeadlineCard, SectionHeader, ServiceCard } from '@/components/molecules';
import { ActivityTimeline, HomeHeader, SummaryGrid } from '@/components/organisms';

interface HomeScreenProps {
  /** Pindah ke tab Layanan dengan filter tertentu. */
  onNavigateToServices: (tab: ServiceTab) => void;
  /** Buka halaman Detail Layanan. */
  onOpenService: (serviceId: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

/**
 * Beranda — PRD §6.2. Urutan prioritas dashboard: layanan terlambat, kendala/perlu perhatian,
 * target terdekat, lalu aktivitas terbaru.
 */
export function HomeScreen({
  onNavigateToServices,
  onOpenService,
  onOpenNotifications,
  onOpenProfile,
}: HomeScreenProps) {
  useStatusBarStyle('light');
  const { services, unreadCount } = useServiceStore();

  const priorityServices = getPriorityServices(services);
  const openService = (service: ServiceItem) => onOpenService(service.id);

  // Jumlah aktif mengikuti data layanan; angka lain masih dummy statis (nanti dari backend).
  const summary = {
    ...operationalSummaryData,
    activeCount:
      operationalSummaryData.activeCount -
      3 +
      services.filter((s) => s.status !== 'Selesai').length,
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHeader
          dateLabel={todayLabel}
          greeting={`Selamat pagi, ${currentUserData.firstName}`}
          subtitle="Berikut ringkasan operasional kantor hari ini."
          userInitials={currentUserData.initials}
          unreadCount={unreadCount}
          onNotificationPress={onOpenNotifications}
          onAvatarPress={onOpenProfile}
        />

        <View style={styles.summary}>
          <SummaryGrid summary={summary} onSelect={onNavigateToServices} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="PRIORITAS HARI INI"
            title="Perlu Perhatian"
            actionLabel="Lihat Semua"
            actionAccessibilityLabel="Lihat semua layanan yang perlu perhatian"
            onActionPress={() => onNavigateToServices('Perlu Perhatian')}
          />
          {priorityServices.map((service) => (
            <ServiceCard key={service.id} item={service} onPress={openService} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="DEADLINE" title="Target Terdekat" />
          <DeadlineCard
            item={nearestDeadlineData}
            onPress={() => onOpenService(nearestDeadlineData.serviceId)}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="AKTIVITAS" title="Aktivitas Terbaru" />
          <ActivityTimeline items={recentActivitiesData} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { paddingBottom: 24 },
  summary: { paddingHorizontal: 16, marginTop: 16 },
  section: { paddingHorizontal: 16, marginTop: 24 },
});
