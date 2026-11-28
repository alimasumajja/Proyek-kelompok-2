import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/atoms';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/(tabs)' : '/screenawal');
  }, [loading, user]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 24,
        gap: 24,
      }}>
      <ActivityIndicator size="large" color="#17352D" />
      <Button label="Prediksi Akta AI (On-Device)" onPress={() => router.replace('/eksperimen-ai')} />
    </View>
  );
}
