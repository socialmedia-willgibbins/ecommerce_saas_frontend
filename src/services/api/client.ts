/**
 * API Client Service
 * Centralized Axios instance with interceptors for T-Stocks Admin Frontend
 * 
 * @module services/api/client
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { ENV, debugLog } from '../../config/env';
import toast from 'react-hot-toast';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Storage keys for tokens
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

/**
 * Token management
 */
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN),
  setAccessToken: (token: string) => localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token),
  setRefreshToken: (token: string) => localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token),
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  },
  getUserData: () => {
    const data = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },
  setUserData: (user: any) => {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  },
};

/**
 * Create Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: ENV.apiUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request Interceptor
   */
  client.interceptors.request.use(
    (config) => {
      const token = tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (ENV.enableApiLogging) {
        debugLog('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   */
  client.interceptors.response.use(
    (response) => {
      if (ENV.enableApiLogging) {
        debugLog('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Network error
      if (!error.response) {
        toast.error('Network error. Please check your connection.');
        throw new ApiError(0, 'Network error');
      }

      const { status, data } = error.response;

      // Token expired - attempt refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(
            `${ENV.apiUrl}/users/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          tokenManager.setAccessToken(access);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          tokenManager.clearTokens();
          window.location.href = '/login';
          throw new ApiError(401, 'Session expired. Please login again.');
        }
      }

      // Handle specific errors
      const errorMessage = (data as any)?.message || (data as any)?.detail || 'An error occurred';

      switch (status) {
        case 400:
          toast.error(errorMessage);
          break;
        case 401:
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
        case 503:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(errorMessage);
      }

      throw new ApiError(status, errorMessage, data);
    }
  );

  return client;
};

/**
 * API Client instance
 */
export const apiClient = createApiClient();

/**
 * Generic request methods
 */
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
