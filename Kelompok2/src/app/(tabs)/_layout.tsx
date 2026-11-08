import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { BottomNavBar } from '@/components/organisms';
import { useAuth } from '@/context/AuthContext';

/**
 * Tab utama hanya dapat diakses setelah sesi Supabase dan profil pengguna tervalidasi.
 */
export default function TabLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#17352D" />
      </View>
    );
  }

  return (
    <Tabs tabBar={(props) => <BottomNavBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="layanan" options={{ title: 'Layanan' }} />
      <Tabs.Screen name="tambah" options={{ title: 'Tambah' }} />
      <Tabs.Screen name="laporan" options={{ title: 'Laporan' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
