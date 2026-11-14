import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, loginWithGoogle, user, loading } = useAuth();
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/(tabs)');
  }, [loading, user]);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      const msg = 'Masukkan email dan kata sandi.';
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

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      Alert.alert('Login Berhasil', `Selamat datang, ${user.name}!`);
      router.replace('/(tabs)');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login dengan Google gagal.';
      // Jika user membatalkan (menutup browser), tidak perlu tampilkan alert
      if (!message.includes('dibatalkan')) {
        setErrorMessage(message);
        Alert.alert('Login Google Gagal', message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isDisabled = submitting || googleLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}>
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
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color="#7a7a7a" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isDisabled}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata sandi</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Masukkan kata sandi"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                editable={!isDisabled}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((current) => !current)}
                disabled={isDisabled}
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
            style={[styles.loginButton, isDisabled && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isDisabled}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tombol Masuk dengan Google */}
          <TouchableOpacity
            style={[styles.googleButton, isDisabled && styles.loginButtonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isDisabled}
            accessibilityLabel="Masuk dengan Google">
            {googleLoading ? (
              <ActivityIndicator color="#17352D" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Ikon Google sederhana menggunakan teks berwarna */
function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1 },
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { color: '#9CA3AF', fontSize: 13 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#1d1d1f',
    fontSize: 16,
    fontWeight: '600',
  },
});