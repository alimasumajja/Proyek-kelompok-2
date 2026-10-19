import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NearestDeadline } from '@/types/service';
import { NotaryColors } from '@/constants/notary-theme';

interface DeadlineCardProps {
  item: NearestDeadline;
  onPress?: () => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ item, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Target Terdekat: ${item.serviceType}, ${item.clientAndStage}`}>
      {/* Date badge on left */}
      <View style={styles.dateBox}>
        <Text style={styles.dayText}>{item.day}</Text>
        <Text style={styles.monthText}>{item.month}</Text>
      </View>

      {/* Middle details */}
      <View style={styles.middleColumn}>
        <Text style={styles.titleText}>{item.serviceType}</Text>
        <Text style={styles.subtitleText}>{item.clientAndStage}</Text>
        <View style={styles.staffRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{item.staff.initials}</Text>
          </View>
          <Text style={styles.staffName}>{item.staff.name}</Text>
        </View>
      </View>

      {/* Right chevron */}
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NotaryColors.card,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  dateBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EEF4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dayText: {
    fontSize: 18,
    fontWeight: '800',
    color: NotaryColors.textPrimary,
    lineHeight: 22,
  },
  monthText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B5248',
    letterSpacing: 0.5,
  },
  middleColumn: {
    flex: 1,
    gap: 3,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
  },
  subtitleText: {
    fontSize: 12.5,
    color: NotaryColors.textSecondary,
    marginBottom: 4,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1DDD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: '#264D43',
  },
  staffName: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '500',
  },
});
