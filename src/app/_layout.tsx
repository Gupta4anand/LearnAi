import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeNetworkMonitoring } from '@/services/network';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { useAuthStore } from '@/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import { useEffect } from 'react';
import 'react-native-reanimated';
import './global.css';

// Register expo-linear-gradient with NativeWind
cssInterop(LinearGradient, {
  className: {
    target: 'style',
  },
});

// Setup React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribeNetwork = initializeNetworkMonitoring();
    initializeAuth();

    if (Constants.appOwnership === 'expo') {
      console.warn('Expo Go does not support full expo-notifications functionality. Use a development build to test notifications.');
      return () => unsubscribeNetwork();
    }

    registerForPushNotificationsAsync();
    return () => unsubscribeNetwork();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName="splash"
          screenOptions={{
            animation: 'slide_from_right',
            animationDuration: 200,
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="courses" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="course/[id]" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
