/**
 * Owner API Service
 * Handles all API calls for platform owner dashboard
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const ownerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
ownerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
ownerApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return ownerApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/owner/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface DashboardStats {
  statistics: {
    total_admins: number;
    total_customers: number;
    total_products: number;
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
  };
  revenue: {
    total_revenue: number;
    platform_commission: number;
    admin_settlement_total: number;
    commission_percentage: number;
  };
  recent_activity: {
    orders_last_7_days: number;
    new_admins_last_7_days: number;
  };
  top_admins: Array<{
    id: number;
    username: string;
    email: string;
    order_count: number;
    total_revenue: number;
  }>;
}

export interface PaymentHistory {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    order_id: number;
    admin: {
      id: number;
      username: string;
      email: string;
    };
    order_total: number;
    platform_commission: number;
    admin_settlement: number;
    status: string;
    settlement_date: string;
    transaction_id: string;
  }>;
}

export interface AuditLog {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    type: string;
    timestamp: string;
    description: string;
    details: Record<string, any>;
  }>;
}

export interface AdminListItem {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  date_joined: string;
  is_active: boolean;
  statistics: {
    product_count: number;
    total_orders: number;
    completed_orders: number;
    total_revenue: number;
    platform_commission_paid: number;
    admin_earnings: number;
  };
}

export interface AdminList {
  count: number;
  results: AdminListItem[];
}

// API Methods
export const ownerApiService = {
  /**
   * Get owner dashboard statistics
   */
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await ownerApi.get('/users/owner/dashboard/');
    return response.data;
  },

  /**
   * Get payment history with optional filters
   */
  getPaymentHistory: async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<PaymentHistory> => {
    const response = await ownerApi.get('/users/owner/payment-history/', { params });
    return response.data;
  },

  /**
   * Get audit log with optional date range
   */
  getAuditLog: async (days: number = 30, page: number = 1): Promise<AuditLog> => {
    const response = await ownerApi.get('/users/owner/audit-log/', {
      params: { days, page },
    });
    return response.data;
  },

  /**
   * Get list of all admins with their performance metrics
   */
  getAdminList: async (search?: string): Promise<AdminList> => {
    const response = await ownerApi.get('/users/owner/admins/', {
      params: { search },
    });
    return response.data;
  },

  /**
   * Owner login (using OTP flow)
   */
  requestOTP: async (email: string, password: string): Promise<{ message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/users/login/`, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Verify OTP and get tokens
   */
  verifyOTP: async (identifier: string, otp: string): Promise<{
    access: string;
    refresh: string;
    user: any;
  }> => {
    const response = await axios.post(`${API_BASE_URL}/users/verify-otp/`, {
      identifier,
      otp,
    });
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    const response = await ownerApi.get('/users/me/');
    return response.data;
  },
};

export default ownerApiService;
