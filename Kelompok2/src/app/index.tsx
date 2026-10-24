import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    const checkSession = async () => {
      // Data statis untuk UTS: asumsikan belum login
      const hasSession = false; 

      if (!hasSession) {
        // Jika belum login, arahkan ke Splash Screen (screenawal)
        router.replace('/screenawal'); 
      } else {
        // Jika sudah login, arahkan ke dasbor utama
         router.replace('/layanan');
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