import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityItem } from '@/types/service';
import { NotaryColors } from '@/constants/notary-theme';

interface ActivityItemRowProps {
  item: ActivityItem;
  isLast?: boolean;
}

export const ActivityItemRow: React.FC<ActivityItemRowProps> = ({ item, isLast = false }) => {
  const getDotColor = () => {
    switch (item.type) {
      case 'update':
        return '#25705E';
      case 'issue':
        return '#C87818';
      case 'completed':
        return '#1E7E68';
      default:
        return '#25705E';
    }
  };

  const dotColor = getDotColor();

  return (
    <View style={styles.container}>
      {/* Timeline indicator column */}
      <View style={styles.indicatorColumn}>
        <View style={[styles.outerDot, { borderColor: dotColor }]}>
          <View style={[styles.innerDot, { backgroundColor: dotColor }]} />
        </View>
        {!isLast && <View style={styles.verticalLine} />}
      </View>

      {/* Content row */}
      <View style={styles.contentContainer}>
        <View style={styles.textWrapper}>
          <Text style={styles.titleText}>
            <Text style={styles.actorText}>{item.actor} </Text>
            {item.action}
          </Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 56,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: 8,
  },
  outerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  verticalLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 22,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    fontSize: 13.5,
    color: NotaryColors.textPrimary,
    fontWeight: '500',
    marginBottom: 3,
  },
  actorText: {
    fontWeight: '700',
    color: NotaryColors.textPrimary,
  },
  descriptionText: {
    fontSize: 12,
    color: NotaryColors.textSecondary,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 11.5,
    color: NotaryColors.textMuted,
    fontWeight: '400',
  },
});
