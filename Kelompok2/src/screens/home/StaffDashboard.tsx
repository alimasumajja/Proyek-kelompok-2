import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ServiceActivity, ServiceItem, ServiceTab } from '@/types/service';
import { sortByDueDate } from '@/utils/activity';
import { formatRelativeTime } from '@/utils/date';
import { getNearestDeadline, getPriorityServices, summarizeServices } from '@/utils/service';
import { Button } from '@/components/atoms';
import { DeadlineCard, EmptyState, SectionHeader, ServiceCard } from '@/components/molecules';
import { HistoryPanel, HomeHeader, SummaryGrid } from '@/components/organisms';
import { useAuth } from '@/context/AuthContext';
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
  const { notes, refreshServices, refreshNotifications } = useServiceStore();
  const { services, unreadCount, servicesLoading } = useSession();
  const { user } = useAuth();

  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  const [staffActivities, setStaffActivities] = useState<ServiceActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStaffActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_activity_logs')
        .select(`
          id, service_id, action, details, created_at,
          actor:profiles!service_activity_logs_actor_id_fkey(full_name),
          service:services!service_activity_logs_service_id_fkey(service_number, client_name)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error || !data) {
        setStaffActivities([]);
        return;
      }

      const mapped: ServiceActivity[] = data.map((act) => {
        const actorValue = act.actor as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
        const actorProfile = Array.isArray(actorValue) ? actorValue[0] : actorValue;
        const actorName = actorProfile?.full_name?.trim() || 'Sistem';

        const serviceValue = act.service as unknown as { service_number: string; client_name: string } | { service_number: string; client_name: string }[] | null;
        const serviceInfo = Array.isArray(serviceValue) ? serviceValue[0] : serviceValue;
        const servicePrefix = serviceInfo?.service_number ? `${serviceInfo.service_number} · ` : '';

        const details = (act.details ?? {}) as Record<string, any>;
        let title = 'Aktivitas layanan';
        let text = `${servicePrefix}${actorName} melakukan pembaruan`;
        let tone: 'green' | 'blue' | 'amber' = 'blue';

        if (act.action === 'service_created') {
          title = 'Layanan dibuat';
          text = `${servicePrefix}Dibuat oleh ${actorName}`;
          tone = 'green';
        } else if (act.action === 'service_stage_changed') {
          const toStage = details.to_stage;
          title = details.change_type === 'skip' ? 'Tahap dilewati' : details.change_type === 'repeat' ? 'Tahap diulang' : 'Tahap diperbarui';
          text = `${servicePrefix}${actorName} memperbarui ke ${toStage ?? 'tahap berikutnya'}`;
          tone = details.change_type === 'skip' ? 'amber' : 'green';
        } else if (act.action === 'service_member_added' || act.action === 'service_member_updated') {
          title = 'Penugasan diperbarui';
          text = `${servicePrefix}Diperbarui oleh ${actorName}`;
          tone = 'blue';
        } else if (act.action === 'service_note_added') {
          const isObstacle = details.category === 'obstacle';
          title = isObstacle ? 'Kendala dicatat' : 'Catatan ditambahkan';
          text = `${servicePrefix}${actorName} menambahkan ${isObstacle ? 'kendala' : 'catatan'}`;
          tone = isObstacle ? 'amber' : 'blue';
        }

        return {
          id: act.id,
          title,
          text,
          time: formatRelativeTime(new Date(act.created_at)),
          tone,
        };
      });

      setStaffActivities(mapped);
    } catch {
      setStaffActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStaffActivities();
    }, [loadStaffActivities]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshServices(),
      refreshNotifications(),
      loadStaffActivities(),
    ]);
    setRefreshing(false);
  }, [refreshServices, refreshNotifications, loadStaffActivities]);

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

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || servicesLoading || activitiesLoading}
            onRefresh={onRefresh}
          />
        }
      >
        <HomeHeader
          dateLabel={dateLabel}
          greeting={`Selamat pagi, ${user?.name?.split(' ')[0] ?? 'Staf'}`}
          subtitle="Berikut tugas Anda hari ini."
          userInitials={user?.initials ?? 'ST'}
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

        {staffActivities.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="AKTIVITAS" title="Aktivitas Saya" />
            <HistoryPanel activities={staffActivities} />
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
