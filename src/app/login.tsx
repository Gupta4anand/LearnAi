import GradientButton from '@/components/GradientButton';
import LoginInput from '@/components/LoginInput';
import { Colors } from '@/constants/theme';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Layout, moderateScale, verticalScale } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Layout.window;

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingForgot, setSendingForgot] = useState(false);
  
  const login = useAuthStore((state) => state.setAuth);

  const isFormValid = email.length > 0 && password.length >= 1;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response: any = await authService.login({
        username: email, // Send full input as username (supports both email and username)
        password: password,
      });

      const { user, accessToken, refreshToken } = response.data;
      await login(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSendingForgot(true);
    try {
      await authService.forgotPassword({ email: forgotEmail });
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
      setForgotModalVisible(false);
      setForgotEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to send reset email. Please try again.');
    } finally {
      setSendingForgot(false);
    }
  };




  return (
    <Animated.View
      entering={FadeInDown.duration(800)}
      className="flex-1 bg-learnAI-background"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Background Shapes (Matching Signup) */}
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

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={moderateScale(60)}
        enableOnAndroid={true}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingTop: height * 0.08, 
          paddingBottom: moderateScale(40) 
        }}
        className="px-6"
      >
        <SafeAreaView className="flex-1">
          {/* Header Section */}
          <View className="items-center mb-6">
            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
              <Text className="text-[10px] font-bold tracking-[1.5px] text-learnAI-accent uppercase">
                Welcome Scholar
              </Text>
            </View>
            <Text className="text-4xl font-extrabold text-white tracking-tighter">
              Learn<Text className="text-learnAI-accent">AI</Text>
            </Text>
            <Text className="text-slate-300 text-base mt-2 font-medium tracking-wide">
              Welcome back
            </Text>
          </View>

          {/* Login Card (Matching Signup Card Exactly) */}
          <View className="w-full rounded-[32px] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-xl font-bold">Sign in</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Access your courses</Text>
              </View>
              <Ionicons name="help-circle-outline" size={24} color={Colors.learnAI.accent} className="opacity-40" />
            </View>

            <LoginInput
              label="Email or Username"
              placeholder="Enter your credentials"
              value={email}
              autoCapitalize="none"
              onChangeText={setEmail}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <LoginInput
              ref={passwordRef}
              label="Password"
              placeholder="••••••••"
              value={password}
              isPassword
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity 
              className="self-end mb-3 mt-1"
              onPress={() => setForgotModalVisible(true)}
            >
              <Text className="text-slate-400 text-sm font-semibold">Forgot Password?</Text>
            </TouchableOpacity>

            <View className="mt-0">
              <GradientButton
                title={loading ? "Authenticating..." : "Login"}
                loading={loading}
                disabled={!isFormValid || loading}
                onPress={handleLogin}
              />
            </View>
          </View>

          {/* Footer Section */}
          <View className="flex-row justify-center items-center mt-10">
            <Text className="text-slate-400 text-[15px]">Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text className="text-learnAI-accent text-[15px] font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#0F172A] rounded-t-[40px] p-8 border-t border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Reset Password</Text>
              <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-slate-400 text-base mb-8">
              Enter the email address associated with your account and we'll send you instructions to reset your password.
            </Text>

            <LoginInput
              label="Email Address"
              placeholder="name@example.com"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoFocus={true}
            />

            <View className="mt-4 mb-4">
              <GradientButton
                title={sendingForgot ? "Sending..." : "Send Instructions"}
                loading={sendingForgot}
                onPress={handleForgotPassword}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}
