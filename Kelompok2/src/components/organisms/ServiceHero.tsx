import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import type { ServiceItem, ServiceStatus } from '@/types/service';
import { hasDueDate } from '@/utils/service';
import { AppText, Avatar, Badge, type BadgeTone } from '../atoms';

const HERO_TONE: Record<ServiceStatus, BadgeTone> = {
  Aktif: 'success',
  'Perlu Perhatian': 'gold',
  Terlambat: 'danger',
  Selesai: 'neutral',
};

/** Blok hijau tua di atas halaman Detail: nomor, status, klien, jenis, target, penanggung jawab. */
export function ServiceHero({ service }: { service: ServiceItem }) {
  return (
    <View style={styles.hero}>
      <View style={styles.topRow}>
        <AppText variant="label" color={NotaryColors.gold} style={styles.code}>
          {service.code}
        </AppText>
        <Badge label={service.status} tone={HERO_TONE[service.status]} />
      </View>

      <AppText variant="display" color="#FFFFFF" accessibilityRole="header" style={styles.name}>
        {service.clientName}
      </AppText>
      <AppText variant="caption" color="rgba(255,255,255,0.72)">
        {service.serviceType}
      </AppText>

      <View style={styles.divider} />

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
          <AppText variant="caption" color="rgba(255,255,255,0.9)">
            {hasDueDate(service.dueDate) ? `Target ${service.dueDate}` : 'Target belum ditentukan'}
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <Avatar initials={service.assignedStaff.initials} size="sm" tone="soft" />
          <AppText variant="caption" color="rgba(255,255,255,0.9)">
            {service.assignedStaff.name}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, backgroundColor: NotaryColors.primary },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { letterSpacing: 0.8 },
  name: { marginTop: 14, marginBottom: 4 },
  divider: { height: 1, marginVertical: 16, backgroundColor: 'rgba(255,255,255,0.14)' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
