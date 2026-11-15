import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLinkingURL } from 'expo-linking';
import { AppText, Button } from '@/components/atoms';
import { NotaryColors, Spacing } from '@/constants/notary-theme';
import { useAuth } from '@/context/AuthContext';
import { isNativeOAuthCallback } from '@/utils/oauth';
import { AuthFlowError, getAuthFeedback, type AuthFeedback } from '@/utils/auth-errors';

/** Menangani callback baik saat aplikasi sudah terbuka maupun baru diluncurkan. */
export function OAuthCallbackScreen() {
  const url = useLinkingURL();
  const { completeGoogleLogin } = useAuth();
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  useEffect(() => {
    let active = true;
    if (!url || !isNativeOAuthCallback(url)) {
      const timer = setTimeout(() => {
        setFeedback(getAuthFeedback(new AuthFlowError('callback_invalid')));
      }, 10000);
      return () => clearTimeout(timer);
    }
    void completeGoogleLogin(url).then(() => {
      if (active) router.replace('/(tabs)');
    }).catch((cause: unknown) => {
      if (active) setFeedback(getAuthFeedback(cause));
    });
    return () => { active = false; };
  }, [url, completeGoogleLogin]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {feedback ? (
        <View style={styles.content}>
          <Feather name="info" size={32} color={NotaryColors.primary} accessible={false} />
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>
            <AppText variant="title">{feedback.title}</AppText>
            <AppText color={NotaryColors.badgeNeutralText}>{feedback.message}</AppText>
          </View>
          <Button label="Kembali ke halaman masuk" onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <>
          <ActivityIndicator color={NotaryColors.primary} size="large" />
          <AppText>Memverifikasi akun kantor Anda…</AppText>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.lg,
    backgroundColor: NotaryColors.background,
  },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: Spacing.xxl },
  message: { gap: Spacing.md },
});
