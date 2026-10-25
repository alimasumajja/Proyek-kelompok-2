import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  // 1. State Management (Penyimpanan Data UI Sementara)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. Fungsi Eksekusi
  const handleLogin = () => {
    // Karena UTS hanya fokus UI, kita abaikan Supabase.
    // Langsung arahkan pengguna ke halaman Dashboard/Home.
    router.replace('./HomeScreen');
  };

  // 3. Kerangka Visual (JSX)
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
              placeholder="notaris@kantor.id"
              value={email}
              onChangeText={setEmail} // Menyimpan ketikan ke state 'email'
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
              onChangeText={setPassword} // Menyimpan ketikan ke state 'password'
              secureTextEntry={!showPassword} // Menyembunyikan teks jika showPassword false
            />
            {/* Tombol Mata (Tampilkan/Sembunyikan Sandi) */}
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

// 4. Styling (CSS-in-JS menggunakan Flexbox)
const styles = StyleSheet.create({
  // ... (Gunakan styling yang sama persis seperti yang saya berikan sebelumnya)
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: '#17352D', paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  logoBox: { borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoLetter: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
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