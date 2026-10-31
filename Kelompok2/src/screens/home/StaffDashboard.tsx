import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import { todayLabel } from '@/data/dummy';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceItem, ServiceTab } from '@/types/service';
import { getRecentActivities, sortByDueDate } from '@/utils/activity';
import { getNearestDeadline, getPriorityServices, summarizeServices } from '@/utils/service';
import { Button } from '@/components/atoms';
import { DeadlineCard, EmptyState, SectionHeader, ServiceCard } from '@/components/molecules';
import { HistoryPanel, HomeHeader, SummaryGrid } from '@/components/organisms';

interface StaffDashboardProps {
  onNavigateToServices: (tab: ServiceTab) => void;
  onOpenService: (serviceId: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  /** Buka formulir Tambah Layanan. */
  onAddService: () => void;
}

/** Berapa layanan "Sedang Dikerjakan" ditampilkan sebelum diarahkan ke halaman Layanan. */
const IN_PROGRESS_LIMIT = 3;

/**
 * Dashboard Staf — fokus pada pekerjaan harian milik sendiri (PRD §9.2–9.3):
 * 1. Ringkasan tugas saya  2. Aksi cepat  3. Perlu tindakan (terlambat/perlu perhatian)
 * 4. Sedang dikerjakan     5. Target terdekat  6. Aktivitas saya
 * Seluruh data hanya dari layanan yang ditugaskan kepada Staf yang login.
 */
export function StaffDashboard({
  onNavigateToServices,
  onOpenService,
  onOpenNotifications,
  onOpenProfile,
  onAddService,
}: StaffDashboardProps) {
  useStatusBarStyle('light');
  const { notes, activities } = useServiceStore();
  const { account, services, unreadCount } = useSession();

  const openService = (service: ServiceItem) => onOpenService(service.id);

  const urgent = getPriorityServices(services);
  const urgentIds = new Set(urgent.map((s) => s.id));
  const inProgress = sortByDueDate(
    services.filter((s) => s.status === 'Aktif' && !urgentIds.has(s.id))
  );
  const issueCount = services.reduce(
    (total, s) => total + (notes[s.id] ?? []).filter((n) => n.category === 'Kendala').length,
    0
  );
  const summary = summarizeServices(services, issueCount);
  const deadline = getNearestDeadline(services);
  const recent = getRecentActivities(services, activities, 4);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHeader
          dateLabel={todayLabel}
          greeting={`Selamat pagi, ${account.name.split(' ')[0]}`}
          subtitle="Berikut tugas Anda hari ini."
          userInitials={account.initials}
          unreadCount={unreadCount}
          onNotificationPress={onOpenNotifications}
          onAvatarPress={onOpenProfile}
        />

        <View style={styles.summary}>
          <SummaryGrid summary={summary} onSelect={onNavigateToServices} />
        </View>

        <View style={styles.quickActions}>
          <View style={styles.flex}>
            <Button label="Catat Layanan" icon="add-circle-outline" onPress={onAddService} />
          </View>
          <View style={styles.flex}>
            <Button
              label="Semua Tugas"
              icon="list-outline"
              variant="secondary"
              onPress={() => onNavigateToServices('Semua')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="PRIORITAS HARI INI"
            title="Perlu Tindakan"
            actionLabel={urgent.length > 0 ? 'Lihat Semua' : undefined}
            actionAccessibilityLabel="Lihat semua tugas yang perlu tindakan"
            onActionPress={() => onNavigateToServices('Terlambat')}
          />
          {urgent.length > 0 ? (
            urgent.map((service) => (
              <ServiceCard key={service.id} item={service} onPress={openService} />
            ))
          ) : (
            <EmptyState
              icon="checkmark-circle-outline"
              title="Semua tugas aman"
              description="Tidak ada layanan terlambat atau perlu perhatian."
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="PEKERJAAN"
            title="Sedang Dikerjakan"
            actionLabel={inProgress.length > IN_PROGRESS_LIMIT ? 'Lihat Semua' : undefined}
            actionAccessibilityLabel="Lihat semua layanan yang sedang dikerjakan"
            onActionPress={() => onNavigateToServices('Aktif')}
          />
          {inProgress.length > 0 ? (
            inProgress
              .slice(0, IN_PROGRESS_LIMIT)
              .map((service) => <ServiceCard key={service.id} item={service} onPress={openService} />)
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="Belum ada layanan berjalan"
              description="Layanan baru yang ditugaskan kepada Anda akan muncul di sini."
              actionLabel="Catat Layanan Baru"
              onActionPress={onAddService}
            />
          )}
        </View>

        {deadline ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="DEADLINE" title="Target Terdekat" />
            <DeadlineCard item={deadline} onPress={() => onOpenService(deadline.serviceId)} />
          </View>
        ) : null}

        {recent.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="AKTIVITAS" title="Aktivitas Saya" />
            <HistoryPanel activities={recent} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { paddingBottom: 24 },
  summary: { paddingHorizontal: 16, marginTop: 16 },
  quickActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  flex: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 24 },
});
