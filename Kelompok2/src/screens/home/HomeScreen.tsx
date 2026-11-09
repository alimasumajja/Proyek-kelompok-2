import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import type { ActivityItem, ServiceItem, ServiceTab } from '@/types/service';
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
  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()).toUpperCase();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoadFailed, setActivitiesLoadFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isNotaris) return;

      let isActive = true;

      const loadRecentActivities = async () => {
        const { data, error } = await supabase
          .from('service_activity_logs')
          .select(`
            id, service_id, action, details, created_at,
            actor:profiles!service_activity_logs_actor_id_fkey(full_name),
            service:services!service_activity_logs_service_id_fkey(service_number, client_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!isActive) return;
        if (error) {
          setActivities([]);
          setActivitiesLoadFailed(true);
          return;
        }

        setActivitiesLoadFailed(false);

        const relativeTime = (value: string) => {
          const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
          if (elapsedMinutes < 1) return 'Baru saja';
          if (elapsedMinutes < 60) return `${elapsedMinutes} menit lalu`;
          const hours = Math.floor(elapsedMinutes / 60);
          if (hours < 24) return `${hours} jam lalu`;
          const days = Math.floor(hours / 24);
          return `${days} hari lalu`;
        };

        const mapped = (data ?? []).map((row): ActivityItem => {
          const actorValue = row.actor as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
          const actor = Array.isArray(actorValue) ? actorValue[0] : actorValue;
          const serviceValue = row.service as unknown as { service_number: string; client_name: string } | { service_number: string; client_name: string }[] | null;
          const service = Array.isArray(serviceValue) ? serviceValue[0] : serviceValue;
          const details = row.details as { member_role?: string } | null;

          let action = 'melakukan pembaruan pada layanan';
          if (row.action === 'service_created') action = 'membuat layanan';
          else if (row.action === 'service_member_added') {
            action = details?.member_role === 'support'
              ? 'menambahkan staf pendukung pada layanan'
              : 'menetapkan penanggung jawab layanan';
          } else if (row.action.includes('issue')) action = 'mencatat kendala pada layanan';
          else if (row.action.includes('stage')) action = 'memperbarui tahap layanan';
          else if (row.action.includes('completed')) action = 'menyelesaikan layanan';

          const isIssue = row.action.includes('issue');
          const isCompleted = row.action.includes('completed');

          return {
            id: row.id,
            serviceId: row.service_id,
            actor: actor?.full_name?.trim() || 'Pengguna',
            action,
            description: service
              ? `${service.service_number} · ${service.client_name}`
              : 'Informasi layanan tidak tersedia',
            time: relativeTime(row.created_at),
            type: isIssue ? 'issue' : isCompleted ? 'completed' : 'update',
          };
        });

        setActivities(mapped);
      };

      void loadRecentActivities();
      return () => {
        isActive = false;
      };
    }, [isNotaris]),
  );
  if (!account) return null;

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
  // Ringkasan dihitung dari layanan yang boleh dilihat akun aktif (Notaris: semua, Staf: miliknya),
  // dari data yang sama dengan halaman Layanan.
  const issueCount = services.reduce(
    (total, s) => total + (notes[s.id] ?? []).filter((n) => n.category === 'Kendala').length,
    0
  );
  const summary = summarizeServices(services, issueCount);

  const deadline = getNearestDeadline(services);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHeader
          dateLabel={dateLabel}
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
            <EmptyState
              icon="time-outline"
              title={activitiesLoadFailed ? 'Aktivitas gagal dimuat' : 'Belum ada aktivitas'}
            />
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
