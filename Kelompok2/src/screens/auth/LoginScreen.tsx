import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace('/(tabs)');
  }, [loading, user]);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      const msg = 'Masukkan email/username dan kata sandi.';
      setErrorMessage(msg);
      Alert.alert('Data belum lengkap', msg);
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      Alert.alert('Login Berhasil', `Selamat datang, ${user.name}!`);
      router.replace('/(tabs)');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email atau kata sandi tidak sesuai.';
      setErrorMessage(message);
      Alert.alert('Login Gagal', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.logoText}>
            Notaris<Text style={styles.logoTextBold}>AI</Text>
          </Text>
        </View>

        <View style={styles.badge}>
          <Feather name="lock" size={12} color="#D4AF37" />
          <Text style={styles.badgeText}>Akses aman kantor</Text>
        </View>
        <Text style={styles.welcomeTitle}>Selamat Datang</Text>
        <Text style={styles.welcomeSubtitle}>Masuk untuk memantau layanan kantor Anda.</Text>
      </View>

      <View style={styles.formContainer}>
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={18} color="#D32F2F" style={{ marginTop: 2 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email atau Username</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={20} color="#7a7a7a" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan email atau username"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kata sandi</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan kata sandi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!submitting}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((current) => !current)}
              disabled={submitting}
              accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
              <Feather
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#7a7a7a"
                style={styles.inputIconRight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, submitting && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    backgroundColor: '#17352D',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  logoBox: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoLetter: {
    color: NotaryColors.gold,
    fontSize: 18,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
  },
  logoText: { color: '#ffffff', fontSize: 20 },
  logoTextBold: { fontWeight: 'bold', color: '#D4AF37' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: { color: '#D4AF37', fontSize: 12, marginLeft: 6, fontWeight: '500' },
  welcomeTitle: { color: '#ffffff', fontSize: 32, fontWeight: '600', marginBottom: 8 },
  welcomeSubtitle: { color: '#cccccc', fontSize: 14, lineHeight: 20 },
  formContainer: { padding: 24, paddingTop: 32 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  errorBannerText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#1d1d1f', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    height: 52,
  },
  inputIcon: { marginRight: 12 },
  inputIconRight: { marginLeft: 12 },
  input: { flex: 1, fontSize: 16, color: '#1d1d1f' },
  loginButton: {
    backgroundColor: '#17352D',
    borderRadius: 9999,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
});