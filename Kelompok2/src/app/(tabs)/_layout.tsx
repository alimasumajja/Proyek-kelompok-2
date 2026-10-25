import { Tabs } from 'expo-router';
import { BottomNavBar } from '@/components/organisms';

/**
 * Layout tab (Bottom Navigation) — PRD §10: Beranda, Layanan, Tambah, Laporan, Profil.
 * Tampilan bar memakai komponen kustom <BottomNavBar /> lewat prop `tabBar`,
 * sedangkan perilaku navigasinya tetap dikelola Expo Router.
 */
export default function TabLayout() {
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
