import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/(tabs)' : '/login');
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.logoText}>
          Notaris<Text style={styles.logoTextBold}>AI</Text>
        </Text>
        <Text style={styles.subtitle}>Manajemen Operasional Kantor Notaris</Text>
      </View>
      <View style={styles.bottomContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <TouchableOpacity
          style={styles.offlineLink}
          onPress={() => router.replace('/eksperimen-ai')}
          accessibilityRole="button"
          accessibilityLabel="Buka Prediksi Akta AI On-Device">
          <Text style={styles.offlineLinkText}>Buka Prediksi Akta AI (Offline)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17352D',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 16,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    color: NotaryColors.gold,
    fontSize: 28,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
  },
  logoText: { color: '#ffffff', fontSize: 28 },
  logoTextBold: { fontWeight: 'bold', color: '#D4AF37' },
  subtitle: { color: '#a0a0a0', fontSize: 14, marginTop: 8 },
  bottomContainer: {
    minHeight: 100,
    gap: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  offlineLink: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  offlineLinkText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
});
