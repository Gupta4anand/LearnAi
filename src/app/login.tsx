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
  ScrollView,
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
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.setAuth);

  const scrollToLowerFields = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          className="flex-1"
        >
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingTop: moderateScale(32), paddingBottom: moderateScale(96) }}
            className="px-6"
          >
            <View className="items-center mt-[10%]">
              <View className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-5">
                <Text className="text-[11px] font-bold tracking-[2px] text-learnAI-accent uppercase">
                  AI Learning Platform
                </Text>
              </View>
              <Text className="text-5xl font-extrabold text-white tracking-tighter">
                Learn<Text className="text-learnAI-accent">AI</Text>
              </Text>
              <Text className="text-slate-200 text-[26px] mt-3 font-bold text-center">
                Welcome back
              </Text>
              <Text className="text-slate-400 text-center text-[15px] leading-6 mt-3 max-w-[82%]">
                Continue your AI journey with saved lessons, interactive modules, and progress that follows you everywhere.
              </Text>
            </View>

            <View className="w-full mt-10 mb-8 rounded-[32px] border border-white/8 bg-white/[0.03] px-5 py-6">
              <Text className="text-white text-xl font-bold">Sign in</Text>
              <Text className="text-slate-400 text-sm mt-1 mb-5">Access your courses and bookmarks</Text>

              <LoginInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                onFocus={scrollToLowerFields}
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
                onFocus={scrollToLowerFields}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity className="self-end mb-6 mt-1">
                <Text className="text-slate-300 text-sm font-semibold">Forgot Password?</Text>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}
