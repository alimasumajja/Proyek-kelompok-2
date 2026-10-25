import { useRouter } from 'expo-router';
import { RepertoriumScreen } from '@/screens/reports/RepertoriumScreen';

/** Route Repertorium: /laporan/repertorium (di luar tab, bottom nav tersembunyi). */
export default function RepertoriumRoute() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/laporan');
  };

  return <RepertoriumScreen onBack={goBack} />;
}