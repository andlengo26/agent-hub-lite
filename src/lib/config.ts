/**
 * Application Configuration
 * Centralizes all configuration values and environment variables
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    enableChat: boolean;
    enableAdvancedAnalytics: boolean;
    enableMultiTenant: boolean;
    enableRealTimeUpdates: boolean;
    enableAILifecycle: boolean;
  };
  ui: {
    defaultPageSize: number;
    maxFileUploadSize: number;
    supportedFileTypes: string[];
  };
  mock: {
    enabled: boolean;
    // Note: apiDelay removed for static mocks (no artificial delay needed)
  };
}

const config: AppConfig = {
  app: {
    name: 'Customer Support AI Agent',
    version: '1.0.0',
    environment: (import.meta.env.MODE as any) || 'development',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    retryAttempts: 3,
  },
  features: {
    enableChat: import.meta.env.VITE_FEATURE_CHAT !== 'false',
    enableAdvancedAnalytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    enableMultiTenant: import.meta.env.VITE_FEATURE_MULTITENANT === 'true',
    enableRealTimeUpdates: import.meta.env.VITE_FEATURE_REALTIME === 'true',
    enableAILifecycle: import.meta.env.VITE_FEATURE_AI_LIFECYCLE !== 'false',
  },
  ui: {
    defaultPageSize: 10,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  },
  mock: {
    enabled: import.meta.env.MODE === 'development',
    // Static mocks don't need artificial delay
  },
};

export default config;

// Helper functions
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isMockEnabled = () => config.mock.enabled;

// Feature flags
export const featureFlags = {
  chat: config.features.enableChat,
  analytics: config.features.enableAdvancedAnalytics,
  multiTenant: config.features.enableMultiTenant,
  realTime: config.features.enableRealTimeUpdates,
  aiLifecycle: config.features.enableAILifecycle,
};