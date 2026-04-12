import React, { useState, forwardRef } from 'react';
import { StyleSheet, TextInput, View, TextInputProps, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { moderateScale, fontScale } from '@/utils/responsive';

interface LoginInputProps extends TextInputProps {
  label?: string;
  isPassword?: boolean;
}

const LoginInput = forwardRef<TextInput, LoginInputProps>(
  ({ label, isPassword, style, secureTextEntry, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[styles.input, style, isPassword && { paddingRight: moderateScale(50) }]}
            placeholderTextColor={Colors.learnAI.placeholder}
            secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity 
              style={styles.toggle} 
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

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
    width: '100%',
  },
  label: {
    color: '#94A3B8',
    fontSize: fontScale(14),
    marginBottom: moderateScale(8),
    marginLeft: moderateScale(4),
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: Colors.learnAI.inputBg,
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    color: Colors.learnAI.text,
    fontSize: fontScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggle: {
    position: 'absolute',
    right: moderateScale(16),
    height: '100%',
    justifyContent: 'center',
  },
});
