import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors } from '@/constants/notary-theme';
import { servicesData } from '@/data/dummy';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceItem } from '@/types/service';

export type LayananTab = 'Semua' | 'Aktif' | 'Terlambat' | 'Selesai';

interface LayananScreenProps {
  initialTab?: LayananTab;
  onAddNewService?: () => void;
  onFilterPress?: () => void;
  onSelectService?: (service: ServiceItem) => void;
}

export const LayananScreen: React.FC<LayananScreenProps> = ({
  initialTab = 'Semua',
  onAddNewService,
  onFilterPress,
  onSelectService,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LayananTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrioritySorted, setIsPrioritySorted] = useState(false);

  // Filtered and searched data
  const filteredServices = useMemo(() => {
    let result = servicesData.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'Aktif') {
        // According to Figma, "Aktif" includes 'Aktif' and 'Perlu Perhatian'
        return item.status === 'Aktif' || item.status === 'Perlu Perhatian';
      }
      if (activeTab === 'Terlambat') {
        return item.status === 'Terlambat';
      }
      if (activeTab === 'Selesai') {
        return item.status === 'Selesai';
      }
      return true; // 'Semua'
    });

    // 2. Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.serviceType.toLowerCase().includes(q) ||
          item.assignedStaff.name.toLowerCase().includes(q)
      );
    }

    // 3. Priority sort
    if (isPrioritySorted) {
      const priorityOrder: Record<string, number> = {
        Tinggi: 3,
        Sedang: 2,
        Rendah: 1,
      };
      result = [...result].sort(
        (a, b) =>
          (priorityOrder[b.priority || 'Rendah'] || 0) -
          (priorityOrder[a.priority || 'Rendah'] || 0)
      );
    }

    return result;
  }, [activeTab, searchQuery, isPrioritySorted]);

  const tabs: LayananTab[] = ['Semua', 'Aktif', 'Terlambat', 'Selesai'];

  const handleReset = () => {
    setActiveTab('Semua');
    setSearchQuery('');
    setIsPrioritySorted(false);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 14) + 6 }]}>
        {/* Logo 'N' inside dark green rounded box */}
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>N</Text>
        </View>

        {/* Center Title */}
        <Text style={styles.headerTitle}>Layanan</Text>

        {/* Plus Action Button */}
        <Pressable
          style={({ pressed }) => [styles.headerAddButton, pressed && styles.pressedOpacity]}
          onPress={onAddNewService}
          accessibilityRole="button"
          accessibilityLabel="Tambah Layanan Baru">
          <Ionicons name="add" size={26} color={NotaryColors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 105 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Search Input and Filter Icon Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#8A92A0"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nomor, klien, atau jenis layanan"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Hapus pencarian">
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Filter Button */}
          <Pressable
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressedOpacity]}
            onPress={onFilterPress}
            accessibilityRole="button"
            accessibilityLabel="Filter Layanan">
            <Ionicons name="options-outline" size={20} color={NotaryColors.textPrimary} />
          </Pressable>
        </View>

        {/* Segmented Control Tabs */}
        <View style={styles.segmentedContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.segmentTab, isActive && styles.segmentTabActive]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Tab ${tab}`}>
                <Text
                  style={[
                    styles.segmentText,
                    isActive ? styles.segmentTextActive : styles.segmentTextInactive,
                  ]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sub-header info: Count and Sort/Reset */}
        <View style={styles.listSubHeader}>
          <Text style={styles.countText}>
            {filteredServices.length} layanan ditemukan
          </Text>

          {activeTab === 'Semua' ? (
            <Pressable
              style={styles.sortButton}
              onPress={() => setIsPrioritySorted(!isPrioritySorted)}
              accessibilityRole="button"
              accessibilityLabel={`Urutkan prioritas, ${isPrioritySorted ? 'aktif' : 'nonaktif'}`}>
              <Ionicons
                name="filter"
                size={14}
                color={isPrioritySorted ? '#133E36' : '#2D6A4F'}
                style={styles.sortIcon}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  isPrioritySorted && styles.sortButtonTextHighlighted,
                ]}>
                Prioritas
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.sortButton}
              onPress={handleReset}
              accessibilityRole="button"
              accessibilityLabel="Reset Filter ke Semua">
              <Ionicons name="filter" size={14} color="#2D6A4F" style={styles.sortIcon} />
              <Text style={styles.sortButtonText}>Reset</Text>
            </Pressable>
          )}
        </View>

        {/* List of Cards */}
        <View style={styles.cardList}>
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                item={service}
                onPress={() => onSelectService?.(service)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={44} color="#B0B7C3" />
              <Text style={styles.emptyTitle}>Tidak ada layanan ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `Tidak ada hasil untuk kata kunci "${searchQuery}"`
                  : `Belum ada berkas dengan status ${activeTab}`}
              </Text>
              {(searchQuery.length > 0 || activeTab !== 'Semua') && (
                <Pressable style={styles.resetSearchButton} onPress={handleReset}>
                  <Text style={styles.resetSearchButtonText}>Tampilkan Semua</Text>
                </Pressable>
              )}
            </View>
          )}
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
  headerContainer: {
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NotaryColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    color: '#D4AF37', // Gold serif letter
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
  },
  headerAddButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressedOpacity: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: NotaryColors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: NotaryColors.segmentBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: NotaryColors.segmentActiveBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12.5,
  },
  segmentTextActive: {
    fontWeight: '700',
    color: NotaryColors.textPrimary,
  },
  segmentTextInactive: {
    fontWeight: '500',
    color: NotaryColors.textSecondary,
  },
  listSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  countText: {
    fontSize: 12.5,
    color: NotaryColors.textSecondary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  sortIcon: {
    marginRight: 2,
  },
  sortButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#265D4F',
  },
  sortButtonTextHighlighted: {
    color: '#133E36',
    fontWeight: '800',
  },
  cardList: {
    gap: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NotaryColors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: NotaryColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  resetSearchButton: {
    marginTop: 12,
    backgroundColor: NotaryColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
