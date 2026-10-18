import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceItem } from '@/types/service';
import { NotaryColors } from '@/constants/notary-theme';

interface ServiceCardProps {
  item: ServiceItem;
  onPress?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onPress }) => {
  const getBadgeStyle = () => {
    switch (item.status) {
      case 'Aktif':
        return {
          container: styles.badgeAktif,
          text: styles.badgeTextAktif,
          icon: null,
        };
      case 'Perlu Perhatian':
        return {
          container: styles.badgePerhatian,
          text: styles.badgeTextPerhatian,
          icon: null,
        };
      case 'Terlambat':
        return {
          container: styles.badgeTerlambat,
          text: styles.badgeTextTerlambat,
          icon: 'time-outline' as const,
        };
      case 'Selesai':
        return {
          container: styles.badgeSelesai,
          text: styles.badgeTextSelesai,
          icon: null,
        };
      default:
        return {
          container: styles.badgeAktif,
          text: styles.badgeTextAktif,
          icon: null,
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Layanan ${item.code}, Klien ${item.clientName}`}>
      {/* Top Header: Code and Status Badge */}
      <View style={styles.topRow}>
        <Text style={styles.codeText}>{item.code}</Text>
        <View style={[styles.badgeBase, badge.container]}>
          {badge.icon && (
            <Ionicons
              name={badge.icon}
              size={12}
              color={NotaryColors.status.terlambat.text}
              style={styles.badgeIcon}
            />
          )}
          <Text style={[styles.badgeTextBase, badge.text]}>{item.status}</Text>
        </View>
      </View>

      {/* Client Name & Service Type */}
      <View style={styles.contentSection}>
        <Text style={styles.clientName}>{item.clientName}</Text>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
      </View>

      {/* Progress Information */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.stageName}>{item.currentStage}</Text>
          <Text style={styles.progressPercent}>{item.progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(Math.max(item.progressPercent, 0), 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Footer: Assigned Staff and Due Date */}
      <View style={styles.footerRow}>
        <View style={styles.staffContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{item.assignedStaff.initials}</Text>
          </View>
          <Text style={styles.staffName}>{item.assignedStaff.name}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={NotaryColors.textSecondary}
            style={styles.calendarIcon}
          />
          <Text style={styles.dateText}>{item.dueDate}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NotaryColors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#265D4F',
    letterSpacing: 0.3,
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeAktif: {
    backgroundColor: NotaryColors.status.aktif.bg,
  },
  badgeTextAktif: {
    color: NotaryColors.status.aktif.text,
  },
  badgePerhatian: {
    backgroundColor: NotaryColors.status.perluPerhatian.bg,
  },
  badgeTextPerhatian: {
    color: NotaryColors.status.perluPerhatian.text,
  },
  badgeTerlambat: {
    backgroundColor: NotaryColors.status.terlambat.bg,
  },
  badgeTextTerlambat: {
    color: NotaryColors.status.terlambat.text,
  },
  badgeSelesai: {
    backgroundColor: NotaryColors.status.selesai.bg,
  },
  badgeTextSelesai: {
    color: NotaryColors.status.selesai.text,
  },
  contentSection: {
    marginBottom: 14,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 13.5,
    color: NotaryColors.textSecondary,
    fontWeight: '400',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageName: {
    fontSize: 12.5,
    color: '#374151',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1B5248',
  },
  progressTrack: {
    height: 6.5,
    backgroundColor: NotaryColors.progressTrack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NotaryColors.progressFill,
    borderRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  staffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1DDD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 10,
    fontWeight: '700',
    color: '#264D43',
  },
  staffName: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  calendarIcon: {
    marginRight: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
});
