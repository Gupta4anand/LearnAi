import GradientButton from '@/components/GradientButton';
import LoginInput from '@/components/LoginInput';
import { Colors } from '@/constants/theme';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Layout, moderateScale, verticalScale } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      const { user, accessToken, refreshToken } = response.data;
      await login(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'User does not exist on the live API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <LinearGradient
          colors={['rgba(74, 110, 219, 0.2)', 'transparent']}
          style={{
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            top: verticalScale(-100),
            left: moderateScale(-50),
            opacity: 0.6
          }}
        />
        <LinearGradient
          colors={['rgba(108, 141, 245, 0.15)', 'transparent']}
          style={{
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            bottom: verticalScale(height * 0.2),
            right: moderateScale(-100),
            opacity: 0.6
          }}
        />
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 px-6 justify-between py-10">
            <View className="items-center mt-[15%]">
              <Text className="text-5xl font-extrabold text-white tracking-tighter">
                Learn<Text className="text-learnAI-accent">AI</Text>
              </Text>
              <Text className="text-slate-400 text-base mt-2 font-medium tracking-wide">
                Welcome back
              </Text>
            </View>

            <View className="w-full mb-10">
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

              <TouchableOpacity className="self-end mb-6">
                <Text className="text-slate-400 text-sm font-medium">Forgot Password?</Text>
              </TouchableOpacity>

              <GradientButton
                title={loading ? "Logging in..." : "Login"}
                loading={loading}
                onPress={handleLogin}
              />
            </View>

            <View className="flex-row justify-center items-center mb-5">
              <Text className="text-slate-400 text-[15px]">Don’t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-learnAI-accent text-[15px] font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}
