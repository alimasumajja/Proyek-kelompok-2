import { useRouter } from 'expo-router';
import { StaffManagementScreen } from '@/screens/profile/StaffManagementScreen';

/** Route Manajemen Staf: /profile/staf (di luar tab, bottom nav tersembunyi). Hanya Notaris. */
export default function StaffManagementRoute() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profil');
  };

  return <StaffManagementScreen onBack={goBack} />;
}
