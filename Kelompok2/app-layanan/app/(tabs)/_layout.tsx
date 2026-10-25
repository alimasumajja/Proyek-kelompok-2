import { Tabs } from 'expo-router';
import React from 'react';
import BottomNav from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props: any) => <BottomNav {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="layanan" />
      <Tabs.Screen name="tambah" />
      <Tabs.Screen name="laporan" />
      <Tabs.Screen name="profil" />
      {/* halaman detail: tidak punya tombol sendiri, tapi navbar tetap tampil */}
      <Tabs.Screen name="detail/[id]" options={{ href: null }} />
    </Tabs>
  );
}
