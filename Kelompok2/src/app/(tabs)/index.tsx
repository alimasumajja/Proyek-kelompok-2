import { useRouter } from 'expo-router';
import { HomeScreen } from '@/screens/home/HomeScreen';
import type { ServiceTab } from '@/types/service';
import { useAuth } from '@/context/AuthContext';
import { StaffDashboard } from '@/screens/home/StaffDashboard';
/** Route Beranda — tab 1. Menghubungkan HomeScreen dengan navigasi (tab & halaman turunan). */
export default function BerandaRoute() {
  const router = useRouter();
  const { user } = useAuth();
  console.log('--- CEK USER BERANDA ---', user);
  const openServices = (tab: ServiceTab) => {
    // `ts` memastikan filter yang sama tetap diterapkan ulang pada ketukan berikutnya.
    router.navigate({
      pathname: '/(tabs)/layanan',
      params: { filter: tab, ts: String(Date.now()) },
    });
  };
  if (user?.role?.toLowerCase().includes('staf')) {
    return (
      <StaffDashboard
        onNavigateToServices={openServices}
        onOpenService={(id) => router.push({ pathname: '/layanan/[id]', params: { id } })}
        onOpenNotifications={() => router.push('/notifikasi')}
        onOpenProfile={() => router.navigate('/(tabs)/profil')}
        onAddService={() => router.navigate('/(tabs)/tambah')}
      />
    );
  }

  return (
    <HomeScreen
      onNavigateToServices={openServices}
      onOpenService={(id) => router.push({ pathname: '/layanan/[id]', params: { id } })}
      onOpenNotifications={() => router.push('/notifikasi')}
      onOpenProfile={() => router.navigate('/(tabs)/profil')}
      onAddService={() => router.navigate('/(tabs)/tambah')}
    />
  );
}
