import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';

/**
 * Route Laporan — Tab 4 dari Bottom Navigation.
 * Placeholder yang akan dikerjakan tim. Sesuai PRD Fase 2.
 */
export default function LaporanTab() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.headerTitle}>Laporan</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.comingSoonCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="bar-chart-outline" size={36} color={NotaryColors.primary} />
          </View>
          <Text style={styles.comingSoonTitle}>Laporan Bulanan</Text>
          <Text style={styles.comingSoonText}>
            Fitur laporan sedang dalam pengembangan Fase 2.{'\n'}
            Meliputi repertorium, validasi data, pratinjau, persetujuan, dan ekspor PDF/Word.
          </Text>
          <View style={styles.featureList}>
            {[
              'Pencatatan repertorium terstruktur',
              'Validasi dan penutupan periode',
              'Generator laporan bulanan',
              'Pratinjau dan persetujuan notaris',
              'Ekspor PDF & Word',
            ].map((item) => (
              <View key={item} style={styles.featureItem}>
                <Ionicons name="ellipse" size={6} color={NotaryColors.primary} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NotaryColors.background },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: NotaryColors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoLetter: { color: '#D4AF37', fontSize: 18, fontWeight: '700', fontFamily: 'serif' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: NotaryColors.textPrimary },
  headerPlaceholder: { width: 36 },
  content: { padding: 20, alignItems: 'center' },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EEF4F1',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
  },
  comingSoonTitle: {
    fontSize: 20, fontWeight: '700',
    color: NotaryColors.textPrimary,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 13.5, color: NotaryColors.textSecondary,
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  featureList: { alignSelf: 'flex-start', width: '100%', gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, color: NotaryColors.textSecondary, fontWeight: '500' },
});
