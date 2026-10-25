import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText, Button } from '../atoms';

interface AiCalloutProps {
  onPress: () => void;
}

/** Ajakan memakai Asisten AI di tab Ringkasan (PRD §8). */
export function AiCallout({ onPress }: AiCalloutProps) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Ionicons name="sparkles-outline" size={20} color="#826633" />
      </View>
      <View style={styles.texts}>
        <AppText variant="label">Butuh ringkasan cepat?</AppText>
        <AppText variant="micro" color={NotaryColors.textSecondary}>
          AI dapat merangkum progres dan kendala layanan ini.
        </AppText>
      </View>
      <Button label="Coba AI" onPress={onPress} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E8D9BC',
    backgroundColor: '#F4EBDA',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBD9B6',
  },
  texts: { flex: 1, gap: 2 },
});
