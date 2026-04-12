import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import LoginInput from '@/components/LoginInput';
import GradientButton from '@/components/GradientButton';
import { moderateScale, fontScale, verticalScale, Layout } from '@/utils/responsive';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const { width, height } = Layout.window;

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    
    setLoading(true);
    try {
      const response: any = await authService.login({
        username: email.split('@')[0],
        password: password,
      });
      
      const { user, accessToken } = response.data;
      await login(user, accessToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'User does not exist on the live API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* Background Shapes */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['rgba(74, 110, 219, 0.2)', 'transparent']}
          style={[styles.blob, { top: verticalScale(-100), left: moderateScale(-50) }]}
        />
        <LinearGradient
          colors={['rgba(108, 141, 245, 0.15)', 'transparent']}
          style={[styles.blob, { bottom: verticalScale(height * 0.2), right: moderateScale(-100) }]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>Learn<Text style={styles.logoAccent}>AI</Text></Text>
              <Text style={styles.tagline}>Welcome back</Text>
            </View>

            <View style={styles.form}>
              <LoginInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <LoginInput
                ref={passwordRef}
                label="Password"
                placeholder="Enter your password"
                value={password}
                isPassword
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <GradientButton
                title={loading ? "Logging in..." : "Login"}
                loading={loading}
                onPress={handleLogin}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.learnAI.background,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    justifyContent: 'space-between',
    paddingVertical: moderateScale(40),
  },
  header: {
    alignItems: 'center',
    marginTop: verticalScale(height * 0.08),
  },
  logo: {
    fontSize: fontScale(42),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoAccent: {
    color: Colors.learnAI.accent,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: fontScale(16),
    marginTop: moderateScale(8),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
    marginBottom: moderateScale(40),
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: moderateScale(24),
  },
  forgotText: {
    color: '#94A3B8',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  footerText: {
    color: '#94A3B8',
    fontSize: fontScale(15),
  },
  signUpText: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(15),
    fontWeight: '700',
  },
});
