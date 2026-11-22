import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { GoogleIcon } from '@/components/atoms/GoogleIcon';
import { Button } from '@/components/atoms/Button';
import { getAuthFeedback, type AuthFeedback } from '@/utils/auth-errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const { login, loginWithGoogle, user, loading } = useAuth();
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const showFeedback = (value: AuthFeedback) => {
    setFeedback(value);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    if (!loading && user) router.replace('/(tabs)');
  }, [loading, user]);

  const handleLogin = async () => {
    if (submitting || googleLoading) return;
    setFeedback(null);
    if (!email.trim() || !password) {
      showFeedback({ title: 'Lengkapi data masuk', message: 'Masukkan email dan kata sandi Anda.' });
      if (!email.trim()) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      showFeedback(getAuthFeedback(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (submitting || googleLoading) return;
    setFeedback(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      const result = getAuthFeedback(error);
      if (!result.cancelled) showFeedback(result);
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
        ref={scrollRef}
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
          <Button label="Coba eksperimen AI offline" variant="outline" onPress={() => router.replace('/eksperimen-ai')} />
          {feedback ? (
            <View style={styles.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Feather name="info" size={18} color={NotaryColors.danger} style={{ marginTop: 2 }} />
              <View style={styles.errorContent}>
                <Text style={styles.errorBannerTitle}>{feedback.title}</Text>
                <Text style={styles.errorBannerText}>{feedback.message}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color="#7a7a7a" style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Masukkan email"
                placeholderTextColor={NotaryColors.badgeNeutralText}
                selectionColor={NotaryColors.primary}
                underlineColorAndroid="transparent"
                accessibilityLabel="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (feedback) setFeedback(null);
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
                placeholderTextColor={NotaryColors.badgeNeutralText}
                selectionColor={NotaryColors.primary}
                underlineColorAndroid="transparent"
                accessibilityLabel="Kata sandi"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (feedback) setFeedback(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                editable={!isDisabled}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                accessibilityRole="button"
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
            accessibilityRole="button"
            accessibilityLabel="Masuk"
            accessibilityState={{ disabled: isDisabled, busy: submitting }}
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
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: googleLoading }}
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
          <Text style={styles.accountHint}>Gunakan email yang sudah didaftarkan oleh Notaris.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: NotaryColors.badgeDangerBg,
    borderWidth: 1,
    borderColor: NotaryColors.badgeDangerBg,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  errorBannerText: {
    color: NotaryColors.badgeDangerText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  errorContent: { flex: 1, gap: 4 },
  errorBannerTitle: { color: NotaryColors.badgeDangerText, fontSize: 14, fontWeight: '600' },
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
    minHeight: 52,
  },
  inputIcon: { marginRight: 12 },
  inputIconRight: { marginLeft: 0 },
  passwordToggle: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 16, color: NotaryColors.textPrimary },
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
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#747775',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  accountHint: { color: NotaryColors.badgeNeutralText, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
  googleButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    fontWeight: '500',
  },
});
