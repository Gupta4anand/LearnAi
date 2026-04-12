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
  ScrollView,
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

const { width, height } = Layout.window;

export default function SignUpScreen() {
  const router = useRouter();
  
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
    try {
      await authService.register({
        username: fullName.replace(/\s/g, '_').toLowerCase(),
        password: password,
        role: "USER", 
        email: email,
      });
      Alert.alert('Success!', 'Account created. Please log in.', [{ text: 'Login', onPress: () => router.replace('/login') }]);
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.logo}>Learn<Text style={styles.logoAccent}>AI</Text></Text>
              <Text style={styles.tagline}>Create your account</Text>
            </View>

            <View style={styles.form}>
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
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

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
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

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
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              
              <View style={styles.btnContainer}>
                <GradientButton
                  title={loading ? "Creating Account..." : "Sign Up"}
                  loading={loading}
                  onPress={handleSignUp}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    justifyContent: 'center',
    paddingVertical: moderateScale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(40),
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
  },
  btnContainer: {
    marginTop: moderateScale(20),
  },
  errorText: {
    color: Colors.learnAI.error,
    fontSize: fontScale(12),
    marginTop: moderateScale(-8),
    marginBottom: moderateScale(12),
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(40),
  },
  footerText: {
    color: '#94A3B8',
    fontSize: fontScale(15),
  },
  loginText: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(15),
    fontWeight: '700',
  },
});
