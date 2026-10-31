import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import {
  nearestDeadlineData,
  recentActivitiesData,
  todayLabel,
} from '@/data/dummy';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceItem, ServiceTab } from '@/types/service';
import { getNearestDeadline, getPriorityServices, summarizeServices } from '@/utils/service';
import { DeadlineCard, EmptyState, SectionHeader, ServiceCard } from '@/components/molecules';
import { ActivityTimeline, HomeHeader, SummaryGrid } from '@/components/organisms';
import { StaffDashboard } from './StaffDashboard';

interface HomeScreenProps {
  /** Pindah ke tab Layanan dengan filter tertentu. */
  onNavigateToServices: (tab: ServiceTab) => void;
  /** Buka halaman Detail Layanan. */
  onOpenService: (serviceId: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  /** Buka formulir Tambah Layanan (dipakai dashboard Staf). */
  onAddService?: () => void;
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
  onAddService,
}: HomeScreenProps) {
  useStatusBarStyle('light');
  const { notes } = useServiceStore();
  const { account, isNotaris, services, unreadCount } = useSession();

  // Staf memiliki dashboard tersendiri (tugas saya), bukan ringkasan kantor.
  if (!isNotaris) {
    return (
      <StaffDashboard
        onNavigateToServices={onNavigateToServices}
        onOpenService={onOpenService}
        onOpenNotifications={onOpenNotifications}
        onOpenProfile={onOpenProfile}
        onAddService={onAddService ?? (() => onNavigateToServices('Semua'))}
      />
    );
  }

  // `services` hanya berisi layanan yang boleh dilihat akun aktif (Staf: yang ditugaskan padanya).
  const priorityServices = getPriorityServices(services);
  const openService = (service: ServiceItem) => onOpenService(service.id);
  const visibleIds = new Set(services.map((s) => s.id));

  // Ringkasan dihitung dari layanan yang boleh dilihat akun aktif (Notaris: semua, Staf: miliknya),
  // dari data yang sama dengan halaman Layanan.
  const issueCount = services.reduce(
    (total, s) => total + (notes[s.id] ?? []).filter((n) => n.category === 'Kendala').length,
    0
  );
  const summary = summarizeServices(services, issueCount);

  const deadline = isNotaris ? nearestDeadlineData : getNearestDeadline(services);
  const activities = isNotaris
    ? recentActivitiesData
    : recentActivitiesData.filter((a) => a.serviceId && visibleIds.has(a.serviceId));

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHeader
          dateLabel={todayLabel}
          greeting={`Selamat pagi, ${account.name.split(' ')[0]}`}
          subtitle={
            isNotaris
              ? 'Berikut ringkasan operasional kantor hari ini.'
              : 'Berikut ringkasan tugas Anda hari ini.'
          }
          userInitials={account.initials}
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
          {priorityServices.length > 0 ? (
            priorityServices.map((service) => (
              <ServiceCard key={service.id} item={service} onPress={openService} />
            ))
          ) : (
            <EmptyState
              icon="checkmark-circle-outline"
              title="Tidak ada layanan yang perlu perhatian"
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="DEADLINE" title="Target Terdekat" />
          {deadline ? (
            <DeadlineCard item={deadline} onPress={() => onOpenService(deadline.serviceId)} />
          ) : (
            <EmptyState icon="calendar-outline" title="Belum ada target mendatang" />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="AKTIVITAS" title="Aktivitas Terbaru" />
          {activities.length > 0 ? (
            <ActivityTimeline items={activities} />
          ) : (
            <EmptyState icon="time-outline" title="Belum ada aktivitas" />
          )}
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
