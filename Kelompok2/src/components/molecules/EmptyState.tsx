import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import { AppText, Button } from '../atoms';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color="#B0B7C3" />
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={NotaryColors.textSecondary} style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onActionPress} compact />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  title: { marginTop: 8 },
  description: { textAlign: 'center', paddingHorizontal: 24 },
  action: { marginTop: 12 },
});
