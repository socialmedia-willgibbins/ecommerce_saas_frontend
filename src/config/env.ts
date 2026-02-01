/**
 * Environment Configuration
 * Handles environment variables for T-Stocks Admin Frontend
 * 
 * @module config/env
 */

interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  mediaUrl: string;
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enableDevTools: boolean;
  cacheTime: number;
  staleTime: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableApiLogging: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  sentryDsn?: string;
  sentryEnvironment?: string;
}

/**
 * Get environment configuration from Vite env variables
 */
export const getEnvConfig = (): EnvironmentConfig => {
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
    mediaUrl: import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000/media',
    appName: import.meta.env.VITE_APP_NAME || 'T-Stocks Admin',
    appVersion: import.meta.env.VITE_APP_VERSION || '3.0.0',
    environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as EnvironmentConfig['environment'],
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
    cacheTime: parseInt(import.meta.env.VITE_CACHE_TIME || '300000', 10),
    staleTime: parseInt(import.meta.env.VITE_STALE_TIME || '60000', 10),
    retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3', 10),
    logLevel: (import.meta.env.VITE_LOG_LEVEL || 'info') as EnvironmentConfig['logLevel'],
    enableApiLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10', 10),
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  };
};

/**
 * Environment configuration instance
 */
export const ENV = getEnvConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = () => ENV.environment === 'development' || import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = () => ENV.environment === 'production' || import.meta.env.PROD;

/**
 * Check if running in staging mode
 */
export const isStaging = () => ENV.environment === 'staging';

/**
 * Get API base URL
 */
export const getApiUrl = () => ENV.apiUrl;

/**
 * Get WebSocket URL
 */
export const getWsUrl = () => ENV.wsUrl;

/**
 * Get Media URL
 */
export const getMediaUrl = () => ENV.mediaUrl;

/**
 * Debug log helper (only logs in development)
 */
export const debugLog = (...args: any[]) => {
  if (isDevelopment() && ENV.enableApiLogging) {
    console.log('[T-Stocks Admin]', ...args);
  }
};

export default ENV;
