import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconLogo } from './icons';

interface ProfilHeaderProps {
  title?: string;
}

export function ProfilHeader({ title = 'Profil' }: ProfilHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <IconLogo size={36} />
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0EC',
  },
  logoWrapper: {
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 36,
  },
});

