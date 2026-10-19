import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  IconLogo,
  IconLock,
  IconMail,
  IconEye,
} from '@/components/profil/icons';
import { NotarisColors } from '@/components/profil/theme';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps = {}) {
  const router = useRouter();

  const [email, setEmail] = useState('notaris@kantor.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      router.replace('/profil');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        {/* Top Dark Green Banner */}
        <View style={styles.topBanner}>
          {/* Logo & Brand */}
          <View style={styles.brandRow}>
            <IconLogo size={36} />
            <Text style={styles.brandName}>Notaris<Text style={styles.brandAi}>AI</Text></Text>
          </View>

          {/* Secure Badge */}
          <View style={styles.secureBadge}>
            <IconLock size={12} color="#E2C795" />
            <Text style={styles.secureText}>Akses aman kantor</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.welcomeTitle}>Selamat Datang</Text>
          <Text style={styles.welcomeSubtitle}>
            Masuk untuk memantau layanan kantor Anda.
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formSection}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <IconMail size={18} color="#6B7280" />
              </View>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Kata Sandi */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kata sandi</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <IconLock size={18} color="#6B7280" />
              </View>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
                style={styles.eyeIcon}>
                <IconEye size={18} color="#6B7280" crossed={showPassword} />
              </Pressable>
            </View>
          </View>

          {/* Masuk Button */}
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.loginButtonText}>Masuk</Text>
          </Pressable>

          {/* Demo Note */}
          <Text style={styles.demoNote}>
            Akun demo telah terisi otomatis. Tidak ada data nyata yang digunakan.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  topBanner: {
    backgroundColor: NotarisColors.primary,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 44,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  brandAi: {
    color: NotarisColors.accent,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
    marginBottom: 14,
  },
  secureText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#E2C795',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13.5,
    color: '#111827',
  },
  eyeIcon: {
    padding: 6,
  },
  loginButton: {
    backgroundColor: NotarisColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  demoNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});

