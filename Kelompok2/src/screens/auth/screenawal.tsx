import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content"/>
      
      {/* Konten Tengah (Logo dan Teks) */}
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        
        <Text style={styles.logoText}>
          Notaris<Text style={styles.logoTextBold}>AI</Text>
        </Text>
        
        <Text style={styles.subtitle}>Manajemen Operasional Kantor Notaris</Text>
      </View>

      {/* Tombol Aksi Bawah */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Masuk</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17352D', // Hijau gelap sesuai desain
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
    borderColor: '#D4AF37', // Garis tepi emas
    borderRadius: 16,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 28,
  },
  logoTextBold: {
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#00875A', // Warna hijau tombol yang lebih terang
    borderRadius: 9999, // Kapsul penuh mengikuti desain Apple
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});