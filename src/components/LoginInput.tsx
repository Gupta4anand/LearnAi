import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface LoginInputProps extends TextInputProps {
  label?: string;
  isPassword?: boolean;
}

const LoginInput = forwardRef<TextInput, LoginInputProps>(
  ({ label, isPassword, className, style, secureTextEntry, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <View className="mb-4 w-full">
        {label && (
          <Text className="text-slate-300 text-[13px] mb-2 ml-1 font-semibold tracking-wide">
            {label}
          </Text>
        )}
        <View className="relative justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-[1px] py-[1px]">
          <TextInput
            ref={ref}
            className={`bg-learnAI-inputBg rounded-[15px] px-4 py-4 text-white text-[15px] ${
              isPassword ? 'pr-12' : ''
            } ${className || ''}`}
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              className="absolute right-4 h-full justify-center"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default LoginInput;
