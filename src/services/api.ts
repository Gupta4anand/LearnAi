import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.freeapi.app/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAuthToken(): Promise<string> {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  if (!refreshToken) {
    throw new Error('Refresh token not available');
  }

  const endpoints = ['/users/refresh', '/users/refresh-token', '/auth/refresh'];
  let refreshResponse: any;

  for (const endpoint of endpoints) {
    try {
      refreshResponse = await refreshClient.post(endpoint, { refreshToken });
      break;
    } catch (error: any) {
      if (error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  if (!refreshResponse) {
    throw new Error('Refresh endpoint not found');
  }

  const responseData = refreshResponse.data?.data ?? refreshResponse.data;
  const newAccessToken = responseData?.accessToken ?? responseData?.token;
  const newRefreshToken = responseData?.refreshToken ?? responseData?.refresh_token;

  if (!newAccessToken) {
    throw new Error('Invalid refresh response');
  }

  await useAuthStore.getState().refreshAuth(newAccessToken, newRefreshToken);
  return newAccessToken;
}

// Add a request interceptor to attach the auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling and token renewal
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAuthToken().catch(async (refreshError) => {
          refreshPromise = null;
          await useAuthStore.getState().logout();
          throw refreshError;
        });
      }

      try {
        const newToken = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject({ ...error, message });
  }
);

export const authService = {
  login: (data: any) => apiClient.post('/users/login', data),
  register: (data: any) => apiClient.post('/users/register', data),
  logout: () => apiClient.post('/users/logout'),
};

export const courseService = {
  getRandomProducts: () => apiClient.get('/public/randomproducts?limit=10'),
  getRandomUsers: () => apiClient.get('/public/randomusers?limit=10'),
};
