import { useRouter } from 'expo-router';
import { NotificationsScreen } from '@/screens/NotificationsScreen';

/** Route Notifikasi: /notifikasi (di luar tab, bottom nav tersembunyi seperti di Figma). */
export default function NotificationsRoute() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <NotificationsScreen
      onBack={goBack}
      onOpenService={(id) => router.push({ pathname: '/layanan/[id]', params: { id } })}
    />
  );
}
