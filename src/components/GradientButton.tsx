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
      className="w-full mt-3"
    >
      <View className="rounded-[30px] border border-white/10 bg-white/5 p-[1px] shadow-lg shadow-learnAI-accent/20">
        <LinearGradient
          colors={disabled ? ['#475569', '#64748B'] : Colors.learnAI.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[29px] py-4 items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-bold tracking-wide">
              {title}
            </Text>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
