import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    const checkSession = async () => {
      // TODO: Ganti dengan logika pengecekan sesi Supabase yang sebenarnya
      const hasSession = false; 

      if (!hasSession) {
        // Jika belum login, arahkan ke file login.tsx
        router.replace('/screenawal'); 
      } else {
        // Jika sudah login, arahkan ke dasbor (misal: home.tsx)
         router.replace('/home'); 
      }
    };

    checkSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#17352D" />
    </View>
  );
}