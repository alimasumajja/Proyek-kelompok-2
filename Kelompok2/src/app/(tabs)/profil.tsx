import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useAuth } from '@/context/AuthContext';

/** Route Profil — logout menggunakan sesi Supabase yang sedang aktif. */
export default function ProfilRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/screenawal');
    } catch (error) {
      Alert.alert(
        'Gagal Keluar',
        error instanceof Error ? error.message : 'Silakan coba kembali.'
      );
    }
  };

  return (
    <ProfileScreen
      onLogout={() => {
        void handleLogout();
      }}
      onOpenStaffManagement={() => router.push('/profile/staf')}
    />
  );
}
