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

export default function SignUpScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Refs for auto-focus flow
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full Name is required';
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be 6+ chars';
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const username = fullName.replace(/\s/g, '_').toLowerCase();

    try {
      const response: any = await authService.register({
        username,
        password,
        role: 'USER',
        email,
      });

      const registeredUser = response?.data?.user;
      const registeredToken = response?.data?.accessToken;
      const registeredRefreshToken = response?.data?.refreshToken;

      if (registeredUser && registeredToken) {
        await setAuth(registeredUser, registeredToken, registeredRefreshToken);
        router.replace('/(tabs)');
        return;
      }

      const loginResponse: any = await authService.login({
        username,
        password,
      });

      const { user, accessToken, refreshToken } = loginResponse?.data || {};

      if (user && accessToken) {
        await setAuth(user, accessToken, refreshToken);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Success!', 'Account created. Please log in.', [{ text: 'Login', onPress: () => router.replace('/login') }]);
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Registration failed.');
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
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: moderateScale(40) }}
            className="px-6"
          >
            <View className="items-center mb-10">
              <Text className="text-5xl font-extrabold text-white tracking-tighter">
                Learn<Text className="text-learnAI-accent">AI</Text>
              </Text>
              <Text className="text-slate-400 text-base mt-2 font-medium tracking-wide">
                Create your account
              </Text>
            </View>

            <View className="w-full">
              <LoginInput
                label="Full Name"
                placeholder="Enter your name"
                value={fullName}
                autoCapitalize="words"
                onChangeText={setFullName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />
              {errors.fullName && <Text className="text-red-500 text-xs -mt-2 mb-3 ml-1">{errors.fullName}</Text>}

              <LoginInput
                ref={emailRef}
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
              {errors.email && <Text className="text-red-500 text-xs -mt-2 mb-3 ml-1">{errors.email}</Text>}

              <LoginInput
                ref={passwordRef}
                label="Password"
                placeholder="6+ characters"
                value={password}
                isPassword
                onChangeText={setPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
              />
              {errors.password && <Text className="text-red-500 text-xs -mt-2 mb-3 ml-1">{errors.password}</Text>}

              <LoginInput
                ref={confirmRef}
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirmPassword}
                isPassword
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              {errors.confirmPassword && <Text className="text-red-500 text-xs -mt-2 mb-3 ml-1">{errors.confirmPassword}</Text>}
              
              <View className="mt-5">
                <GradientButton
                  title={loading ? "Creating Account..." : "Sign Up"}
                  loading={loading}
                  onPress={handleSignUp}
                />
              </View>
            </View>

            <View className="flex-row justify-center items-center mt-10">
              <Text className="text-slate-400 text-[15px]">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text className="text-learnAI-accent text-[15px] font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}
