import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => Promise<void>;
  refreshAuth: (token: string, refreshToken?: string) => Promise<void>;
  updateProfile: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, token, refreshToken) => {
    await SecureStore.setItemAsync('user_token', token);
    if (refreshToken) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
    }
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true });
  },

  refreshAuth: async (token, refreshToken) => {
    await SecureStore.setItemAsync('user_token', token);
    if (refreshToken) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
    }
    set((state) => ({
      token,
      refreshToken: refreshToken ?? state.refreshToken,
      isAuthenticated: true,
      user: state.user,
    }));
  },

  updateProfile: async (user) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      set((state) => ({ user, token: state.token, refreshToken: state.refreshToken, isAuthenticated: true }));
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        set({ 
          user: JSON.parse(userData), 
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
