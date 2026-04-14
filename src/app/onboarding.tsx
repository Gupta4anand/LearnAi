import GradientButton from '@/components/GradientButton';
import { Colors } from '@/constants/theme';
import { Layout } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat,
  withSequence,
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Layout.window;

interface OnboardingData {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.prototype.props.name;
  color: string;
}

const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: '1',
    title: 'Learn Smarter',
    subtitle: 'AI-powered learning designed for you',
    icon: 'git-network-outline',
    color: '#4A6EDB',
  },
  {
    id: '2',
    title: 'Stay Consistent',
    subtitle: 'Track progress and build habits',
    icon: 'trending-up-outline',
    color: '#10B981', 
  },
  {
    id: '3',
    title: 'Experience Learning',
    subtitle: 'Interactive and engaging lessons',
    icon: 'layers-outline',
    color: '#8B5CF6', 
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = async () => {
    if (activeIndex < ONBOARDING_DATA.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  };

  const currentItem = ONBOARDING_DATA[activeIndex];

  return (
    <View className="flex-1 bg-learnAI-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Deep Dark Background Gradient */}
      <LinearGradient
        colors={['#0F172A', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView className="flex-1 justify-between">
        {/* Skip Option */}
        <View className="flex-row justify-end px-6 pt-4 z-50">
          <TouchableOpacity onPress={completeOnboarding}>
            <Text className="text-slate-400 text-base font-semibold tracking-wide">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View className="flex-1 justify-center px-8">
          <Animated.View 
            key={activeIndex} 
            entering={FadeInRight.duration(600).springify().damping(20)}
            exiting={FadeOutLeft.duration(400)}
            className="items-center w-full"
          >
            {/* Immersive Animated Visual */}
            <FloatingIllustration item={currentItem} />

            {/* Typography */}
            <Animated.View entering={FadeInDown.delay(200).duration(800)} className="w-full items-center mt-12">
              <Text className="text-white text-[42px] font-extrabold text-center tracking-tight leading-[48px] mb-4">
                {currentItem.title}
              </Text>
              <Text className="text-slate-400 text-[17px] text-center font-medium leading-relaxed max-w-[80%]">
                {currentItem.subtitle}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <View className="px-8 pb-12">
          {/* Animated Progress Indicator */}
          <View className="flex-row justify-center items-center mb-8 gap-x-2">
            {ONBOARDING_DATA.map((_, index) => (
              <ProgressDot key={index} active={index === activeIndex} activeColor={currentItem.color} />
            ))}
          </View>

          {/* CTA Button */}
          <GradientButton 
            title={activeIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Continue"} 
            onPress={handleNext} 
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

// Subcomponent: Animated Floating Illustration
function FloatingIllustration({ item }: { item: OnboardingData }) {
  const floatValue = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  return (
    <View className="items-center justify-center relative w-full h-[300px]">
      {/* Immersive Glow Effect behind Icon */}
      <View 
        className="absolute w-[250px] h-[250px] rounded-full opacity-30"
        style={{ backgroundColor: item.color, filter: 'blur(60px)' }} 
      />
      
      {/* Secondary Glow */}
      <View 
        className="absolute w-[150px] h-[150px] rounded-full opacity-40 ml-20 mt-20"
        style={{ backgroundColor: '#ffffff', filter: 'blur(50px)' }} 
      />

      {/* Main Glassmorphism Icon Card */}
      <Animated.View style={floatingStyle} className="z-10">
        <View 
          className="w-[200px] h-[200px] rounded-[50px] items-center justify-center border shadow-2xl"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            borderColor: 'rgba(255,255,255,0.08)',
            shadowColor: item.color,
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
          }}
        >
          <Ionicons name={item.icon} size={90} color={item.color} />
        </View>
      </Animated.View>
    </View>
  );
}

// Subcomponent: Animated Progress Dot
function ProgressDot({ active, activeColor }: { active: boolean, activeColor: string }) {
  const widthValue = useSharedValue(active ? 32 : 8);
  const opacityValue = useSharedValue(active ? 1 : 0.2);

  useEffect(() => {
    widthValue.value = withSpring(active ? 32 : 8, { damping: 15, stiffness: 100 });
    opacityValue.value = withTiming(active ? 1 : 0.2, { duration: 300 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: widthValue.value,
    opacity: opacityValue.value,
    backgroundColor: active ? activeColor : '#94A3B8'
  }));

  return (
    <Animated.View 
      style={animatedStyle}
      className="h-2 rounded-full"
    />
  );
}
