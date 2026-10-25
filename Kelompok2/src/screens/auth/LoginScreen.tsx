import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';
import {userAccountsData } from '@/data/dummy';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. Fungsi Eksekusi (Terhubung dengan dummy.ts)
  const handleLogin = () => {
    const inputEmail = email.trim().toLowerCase();

    // Mencari kecocokan data di array userAccountsData
    const matchedUser = userAccountsData.find(
      (user) => user.email.toLowerCase() === inputEmail && user.password === password
    );

    // Jika data ditemukan
    if (matchedUser) {
      // Pengecekan ekstra: Tolak akses jika akun berstatus Nonaktif (contoh: akun dewi)
      if (matchedUser.status === 'Nonaktif') {
        Alert.alert('Akses Ditolak', 'Akun Anda saat ini dinonaktifkan. Silakan hubungi Admin/Notaris.');
        return;
      }

      // Login berhasil
      Alert.alert('Login Berhasil', `Selamat datang, ${matchedUser.name}!\nMasuk sebagai: ${matchedUser.role}`);
      
      // Arahkan ke dasbor
      router.replace('/(tabs)');
    } 
    // Jika data tidak cocok atau kosong
    else {
      Alert.alert(
        'Login Gagal', 
        'Email atau kata sandi salah.\n\nContoh akses:\nEmail: nadia.larasati@kantor.id\nSandi: notaris123'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      
      {/* --- Bagian Header Hijau --- */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.logoText}>Notaris<Text style={styles.logoTextBold}>AI</Text></Text>
        </View>

        <View style={styles.badge}>
          <Feather name="lock" size={12} color="#D4AF37" />
          <Text style={styles.badgeText}>Akses aman kantor</Text>
        </View>
        <Text style={styles.welcomeTitle}>Selamat Datang</Text>
        <Text style={styles.welcomeSubtitle}>Masuk untuk memantau layanan kantor Anda.</Text>
      </View>

      {/* --- Bagian Formulir --- */}
      <View style={styles.formContainer}>
        
        {/* Kolom Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={20} color="#7a7a7a" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="nadia.larasati@kantor.id"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Kolom Kata Sandi */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kata sandi</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#7a7a7a" style={styles.inputIconRight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Tombol Masuk --- */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Masuk</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

// ... (Styles tetap sama persis seperti sebelumnya)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: '#17352D', paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  logoBox: { borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoLetter: { color: NotaryColors.gold, fontSize: 18 ,fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
  logoText: { color: '#ffffff', fontSize: 20 },
  logoTextBold: { fontWeight: 'bold', color: '#D4AF37' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText: { color: '#D4AF37', fontSize: 12, marginLeft: 6, fontWeight: '500' },
  welcomeTitle: { color: '#ffffff', fontSize: 32, fontWeight: '600', marginBottom: 8 },
  welcomeSubtitle: { color: '#cccccc', fontSize: 14, lineHeight: 20 },
  formContainer: { padding: 24, paddingTop: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#1d1d1f', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#ffffff', height: 52 },
  inputIcon: { marginRight: 12 },
  inputIconRight: { marginLeft: 12 },
  input: { flex: 1, fontSize: 16, color: '#1d1d1f' },
  loginButton: { backgroundColor: '#17352D', borderRadius: 9999, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  loginButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
});