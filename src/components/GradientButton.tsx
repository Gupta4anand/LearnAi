import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function GradientButton({ onPress, title, loading, disabled }: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      className="w-full mt-3 shadow-lg shadow-learnAI-accent/30"
    >
      <LinearGradient
        colors={Colors.learnAI.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[30px] py-4 items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-lg font-semibold tracking-wide">
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
