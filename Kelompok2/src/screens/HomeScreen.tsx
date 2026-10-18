import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import {
  operationalSummaryData,
  servicesData,
  nearestDeadlineData,
  recentActivitiesData,
} from '@/data/dummy';
import { SummaryCard } from '@/components/SummaryCard';
import { ServiceCard } from '@/components/ServiceCard';
import { DeadlineCard } from '@/components/DeadlineCard';
import { ActivityItemRow } from '@/components/ActivityItemRow';

interface HomeScreenProps {
  onNavigateToLayanan?: (initialTab?: 'Semua' | 'Aktif' | 'Terlambat' | 'Selesai') => void;
  onSelectService?: (serviceId: string) => void;
  onNotificationPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToLayanan,
  onSelectService,
  onNotificationPress,
}) => {
  const insets = useSafeAreaInsets();

  // Priority cards from dummy services (Perlu Perhatian & Terlambat)
  const priorityServices = servicesData.filter(
    (item) => item.status === 'Perlu Perhatian' || item.status === 'Terlambat'
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={NotaryColors.primary} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 105 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Top Dark Green Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerGreetingColumn}>
              <Text style={styles.headerDateText}>SELASA, 12 MARET 2026</Text>
              <Text style={styles.headerGreetingTitle}>Selamat pagi, Nadia</Text>
              <Text style={styles.headerGreetingSubtitle}>
                Berikut ringkasan operasional kantor hari ini.
              </Text>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>NL</Text>
            </View>
          </View>

          {/* Notification Bell Button */}
          <View style={styles.headerActionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.notificationButtonPressed,
              ]}
              onPress={onNotificationPress}
              accessibilityRole="button"
              accessibilityLabel="Notifikasi, 3 belum dibaca">
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 4 Summary Cards Grid */}
        <View style={styles.summaryGridContainer}>
          <View style={styles.summaryGridRow}>
            <SummaryCard
              type="active"
              count={operationalSummaryData.activeCount}
              label="Layanan Aktif"
              footerText="Ketuk untuk melihat"
              onPress={() => onNavigateToLayanan?.('Aktif')}
            />
            <SummaryCard
              type="completed"
              count={operationalSummaryData.completedCount}
              label="Layanan Selesai"
              footerText="Bulan ini"
              onPress={() => onNavigateToLayanan?.('Selesai')}
            />
          </View>

          <View style={styles.summaryGridRow}>
            <SummaryCard
              type="late"
              count={operationalSummaryData.lateCount}
              label="Terlambat"
              footerText="Perlu tindakan"
              onPress={() => onNavigateToLayanan?.('Terlambat')}
            />
            <SummaryCard
              type="attention"
              count={operationalSummaryData.attentionCount}
              label="Perlu Perhatian"
              footerText="2 kendala baru"
              onPress={() => onNavigateToLayanan?.('Aktif')}
            />
          </View>
        </View>

        {/* Section: Prioritas Hari Ini (Perlu Perhatian) */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionSuperHeader}>PRIORITAS HARI INI</Text>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Perlu Perhatian</Text>
            <Pressable
              onPress={() => onNavigateToLayanan?.('Aktif')}
              accessibilityRole="link"
              accessibilityLabel="Lihat Semua Layanan Perlu Perhatian">
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </Pressable>
          </View>

          <View style={styles.cardsList}>
            {priorityServices.map((service) => (
              <ServiceCard
                key={service.id}
                item={service}
                onPress={() => onSelectService?.(service.id)}
              />
            ))}
          </View>
        </View>

        {/* Section: Deadline (Target Terdekat) */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionSuperHeader}>DEADLINE</Text>
          <Text style={styles.sectionTitleWithoutAction}>Target Terdekat</Text>
          <DeadlineCard
            item={nearestDeadlineData}
            onPress={() => onNavigateToLayanan?.('Aktif')}
          />
        </View>

        {/* Section: Aktivitas Terbaru */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionSuperHeader}>AKTIVITAS</Text>
          <Text style={styles.sectionTitleWithoutAction}>Aktivitas Terbaru</Text>

          <View style={styles.activityTimelineCard}>
            {recentActivitiesData.map((activity, index) => (
              <ActivityItemRow
                key={activity.id}
                item={activity}
                isLast={index === recentActivitiesData.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: NotaryColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    backgroundColor: NotaryColors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreetingColumn: {
    flex: 1,
    paddingRight: 16,
  },
  headerDateText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NotaryColors.headerDateGold,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  headerGreetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerGreetingSubtitle: {
    fontSize: 13,
    color: NotaryColors.headerSubtitleSage,
    lineHeight: 18,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E232A',
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: NotaryColors.headerNotifBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationButtonPressed: {
    opacity: 0.8,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: NotaryColors.headerNotifBadge,
    width: 17,
    height: 17,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: NotaryColors.primary,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  summaryGridContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  summaryGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionWrapper: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionSuperHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NotaryColors.textSecondary,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
  },
  sectionTitleWithoutAction: {
    fontSize: 18,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B5248',
  },
  cardsList: {
    gap: 0,
  },
  activityTimelineCard: {
    backgroundColor: NotaryColors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
});
