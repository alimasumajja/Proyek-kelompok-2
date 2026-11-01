import { useRouter } from 'expo-router';
import { ReportPreviewScreen } from '@/screens/reports/ReportPreviewScreen';

/** Route Pratinjau Laporan: /laporan/pratinjau (di luar tab, bottom nav tersembunyi). */
export default function PratinjauRoute() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/laporan');
  };

  return <ReportPreviewScreen onBack={goBack} />;
}