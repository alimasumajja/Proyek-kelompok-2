import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FigmaTokens, NotaryColors } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface UnderlineTabsProps<T extends string> {
  tabs: readonly T[];
  value: T;
  onChange: (tab: T) => void;
}

/** Tab dengan garis bawah (Ringkasan / Alur Kerja / Catatan / Riwayat). */
export function UnderlineTabs<T extends string>({ tabs, value, onChange }: UnderlineTabsProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}>
            <AppText
              variant={active ? 'label' : 'caption'}
              color={active ? NotaryColors.primary : NotaryColors.textSecondary}
              style={active ? styles.activeText : undefined}>
              {tab}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: NotaryColors.primary },
  activeText: { fontFamily: FigmaTokens.fonts.bold },
});
