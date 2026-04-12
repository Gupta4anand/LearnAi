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

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
