import React, { useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';
import { useKeyboard } from '@/hooks/useKeyboard';

interface KeyboardAwareLayoutProps {
  children: React.ReactNode;
  offset?: number;
}

export default function KeyboardAwareLayout({ children, offset = 0.4 }: KeyboardAwareLayoutProps) {
  const keyboardHeight = useKeyboard();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -keyboardHeight * offset,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [keyboardHeight, offset]);

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
