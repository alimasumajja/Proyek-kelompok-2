import { Image, StyleSheet, View } from 'react-native';

/** Aset Google resmi; viewport hanya menampilkan logo G, tanpa bingkai tombol aset. */
export function GoogleIcon() {
  return (
    <View style={styles.viewport} accessible={false} importantForAccessibility="no-hide-descendants">
      <Image
        source={require('../../../assets/images/google-signin-icon.png')}
        style={styles.image}
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { width: 20, height: 20, overflow: 'hidden' },
  image: { width: 40, height: 40, position: 'absolute', top: -10, left: -10 },
});
