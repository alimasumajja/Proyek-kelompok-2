import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';

export type TabKey = 'home' | 'layanan' | 'tambah' | 'laporan' | 'profil';

interface CustomBottomNavProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

export const CustomBottomNav: React.FC<CustomBottomNavProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  // Ensure comfortable bottom padding above navigation bar / gesture pill
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 16) + 8;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* 1. Beranda Tab */}
      <Pressable
        style={styles.tabButton}
        onPress={() => onTabPress('home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'home' }}
        accessibilityLabel="Beranda">
        <Ionicons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={22}
          color={activeTab === 'home' ? NotaryColors.tabActive : NotaryColors.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}>
          Beranda
        </Text>
      </Pressable>

      {/* 2. Layanan Tab */}
      <Pressable
        style={styles.tabButton}
        onPress={() => onTabPress('layanan')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'layanan' }}
        accessibilityLabel="Layanan">
        <Ionicons
          name={activeTab === 'layanan' ? 'briefcase' : 'briefcase-outline'}
          size={22}
          color={activeTab === 'layanan' ? NotaryColors.tabActive : NotaryColors.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'layanan' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}>
          Layanan
        </Text>
      </Pressable>

      {/* 3. Center Elevated Tambah Button */}
      <View style={styles.centerButtonWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.centerButton,
            pressed && styles.centerButtonPressed,
          ]}
          onPress={() => onTabPress('tambah')}
          accessibilityRole="button"
          accessibilityLabel="Tambah Berkas Baru">
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.centerButtonLabel}>Tambah</Text>
      </View>

      {/* 4. Laporan Tab */}
      <Pressable
        style={styles.tabButton}
        onPress={() => onTabPress('laporan')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'laporan' }}
        accessibilityLabel="Laporan">
        <Ionicons
          name={activeTab === 'laporan' ? 'bar-chart' : 'bar-chart-outline'}
          size={22}
          color={activeTab === 'laporan' ? NotaryColors.tabActive : NotaryColors.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'laporan' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}>
          Laporan
        </Text>
      </Pressable>

      {/* 5. Profil Tab */}
      <Pressable
        style={styles.tabButton}
        onPress={() => onTabPress('profil')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'profil' }}
        accessibilityLabel="Profil">
        <Ionicons
          name={activeTab === 'profil' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profil' ? NotaryColors.tabActive : NotaryColors.tabInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'profil' ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}>
          Profil
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: NotaryColors.tabActive,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: NotaryColors.tabInactive,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: NotaryColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: NotaryColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  centerButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.95 }],
  },
  centerButtonLabel: {
    fontSize: 10,
    color: NotaryColors.tabInactive,
    marginTop: 4,
    fontWeight: '500',
  },
});

