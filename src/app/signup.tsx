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

export default function SignUpScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (field?: string, value?: string) => {
    let newErrors = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'fullName' || !field) {
      if (!(value || fullName)) {
        newErrors.fullName = 'Full Name is required';
      } else if (!(value || fullName).trim().includes(' ')) {
        newErrors.fullName = 'Please enter both first and last name';
      } else {
        delete newErrors.fullName;
      }
    }

    if (field === 'email' || !field) {
      if (!(value || email)) newErrors.email = 'Email is required';
      else if (!emailRegex.test(value || email)) newErrors.email = 'Enter a valid email';
      else delete newErrors.email;
    }

    if (field === 'password' || !field) {
      if ((value || password).length < 6) newErrors.password = 'Password must be 6+ characters';
      else delete newErrors.password;
    }

    if (field === 'confirmPassword' || !field) {
      if ((value || confirmPassword) !== password) newErrors.confirmPassword = 'Passwords do not match';
      else delete newErrors.confirmPassword;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = fullName.trim().includes(' ') &&
                     fullName.trim().length >= 3 &&
                     email.length > 0 && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
                     password.length >= 6 && 
                     confirmPassword === password;

  const handleSignUp = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const username = fullName.replace(/\s/g, '_').toLowerCase() || email.split('@')[0];
      
      // 1. Register the user
      await authService.register({
        username,
        password,
        role: 'USER',
        email,
      });

      // 2. Automatically log in after successful registration
      const loginResponse: any = await authService.login({
        username,
        password,
      });

      const { user, accessToken, refreshToken } = loginResponse.data;
      
      if (user && accessToken) {
        // Enriched user object with fullName if missing from API
        const authenticatedUser = { 
          ...user, 
          fullName: fullName || user.username 
        };
        
        await setAuth(authenticatedUser, accessToken, refreshToken);
        router.replace('/(tabs)');
      } else {
        // Fallback to login screen if something went wrong with auto-login
        Alert.alert('Success!', 'Account created successfully. Please log in.');
        router.replace('/login');
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };




  return (
    <View className="flex-1 bg-learnAI-background">
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

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={moderateScale(100)}
        enableOnAndroid={true}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingTop: height * 0.05, 
          paddingBottom: moderateScale(40) 
        }}
        className="px-6"
      >
        <SafeAreaView className="flex-1">
          <Animated.View entering={FadeInDown.delay(100).duration(800)} className="items-center mb-6">
            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
              <Text className="text-[10px] font-bold tracking-[1.5px] text-learnAI-accent uppercase">
                Start Learning AI
              </Text>
            </View>
            <Text className="text-4xl font-extrabold text-white tracking-tighter">
              Learn<Text className="text-learnAI-accent">AI</Text>
            </Text>
            <Text className="text-slate-300 text-base mt-2 font-medium tracking-wide">
              Create your account
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)} 
            className="w-full rounded-[32px] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-xl font-bold">Sign up</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Join our AI community</Text>
              </View>
              <Ionicons name="person-add-outline" size={24} color={Colors.learnAI.accent} className="opacity-50" />
            </View>

            <LoginInput
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                validate('fullName', val);
              }}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.fullName && <Text className="text-red-500/80 text-[11px] font-semibold -mt-2 mb-3 ml-1">{errors.fullName}</Text>}

            <LoginInput
              ref={emailRef}
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              keyboardType="email-address"
              autoFocus={false}
              onChangeText={(val) => {
                setEmail(val);
                validate('email', val);
              }}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.email && <Text className="text-red-500/80 text-[11px] font-semibold -mt-2 mb-3 ml-1">{errors.email}</Text>}

            <LoginInput
              ref={passwordRef}
              label="Password"
              placeholder="6+ characters"
              value={password}
              isPassword
              onChangeText={(val) => {
                setPassword(val);
                validate('password', val);
              }}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.password && <Text className="text-red-500/80 text-[11px] font-semibold -mt-2 mb-3 ml-1">{errors.password}</Text>}

            <LoginInput
              ref={confirmRef}
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              isPassword
              onChangeText={(val) => {
                setConfirmPassword(val);
                validate('confirmPassword', val);
              }}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
            {errors.confirmPassword && <Text className="text-red-500/80 text-[11px] font-semibold -mt-2 mb-3 ml-1">{errors.confirmPassword}</Text>}
            
            <View className="mt-4">
              <GradientButton
                title={loading ? "Creating Account..." : "Sign Up"}
                loading={loading}
                disabled={!isFormValid || loading}
                onPress={handleSignUp}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(800)} className="flex-row justify-center items-center mt-10">
            <Text className="text-slate-400 text-[15px]">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-learnAI-accent text-[15px] font-bold">Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
}
