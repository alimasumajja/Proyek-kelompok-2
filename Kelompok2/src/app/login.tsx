import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Ganti dengan logika Supabase Auth
    console.log('Login ditekan dengan email:', email);
    
    // Contoh navigasi ke dasbor jika login sukses
     router.replace('/home');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#17352D" />
      
      {/* Bagian Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.logoText}>Notaris<Text style={styles.logoTextBold}>AI</Text></Text>
        </View>

        <Text style={styles.welcomeTitle}>Selamat Datang</Text>
      </View>

      {/* Bagian Form */}
      <View style={styles.formContainer}>
        {/* Input Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            {/* <Feather name="mail" size={20} color="#7a7a7a" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.input}
              placeholder="notaris@kantor.id"
              placeholderTextColor="#cccccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Input Kata Sandi */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kata sandi</Text>
          <View style={styles.inputWrapper}>
            {/* <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#cccccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#7a7a7a" style={styles.inputIconRight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Masuk */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Masuk</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#17352D', 
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    // borderBottomLeftRadius: 32,
    // borderBottomRightRadius: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    borderWidth: 1,
    // borderColor: '#D4AF37', 
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoLetter: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
  },
  logoTextBold: {
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    padding: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#1d1d1f',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconRight: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1d1d1f',
  },
  loginButton: {
    backgroundColor: '#17352D',
    borderRadius: 9999, 
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});