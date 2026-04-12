import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, Animated, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { fontScale, moderateScale, verticalScale, Layout } from '@/utils/responsive';

const { width, height } = Layout.window;

import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth and navigate after animation
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0F172A', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      {/* Abstract Background Elements (Subtle Neural Lines) */}
      <View style={styles.decorContainer}>
        <View style={[styles.neuralLine, { top: '20%', left: '10%', transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.neuralLine, { top: '60%', right: '5%', transform: [{ rotate: '-30deg' }] }]} />
        <View style={[styles.dot, { top: '30%', left: '20%' }]} />
        <View style={[styles.dot, { top: '50%', right: '15%' }]} />
        <View style={[styles.dot, { bottom: '25%', left: '30%' }]} />
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Learn<Text style={styles.logoAccent}>AI</Text></Text>
          <View style={styles.glow} />
        </View>
        <Text style={styles.tagline}>Learn smarter with AI</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  neuralLine: {
    position: 'absolute',
    width: width,
    height: 1,
    backgroundColor: 'rgba(74, 110, 219, 0.3)',
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(108, 141, 245, 0.4)',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: fontScale(56),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
    zIndex: 1,
  },
  logoAccent: {
    color: '#6C8DF5',
  },
  glow: {
    position: 'absolute',
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: 60,
    backgroundColor: 'rgba(108, 141, 245, 0.15)',
    filter: 'blur(30px)', // Note: standard RN doesn't support filter, but we'll use a blurred View technique or just opacity
    opacity: 0.5,
  },
  tagline: {
    fontSize: fontScale(16),
    color: '#94A3B8',
    marginTop: moderateScale(12),
    letterSpacing: 1,
    fontWeight: '300',
  },
});
