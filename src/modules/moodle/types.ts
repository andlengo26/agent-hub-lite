/**
 * Consolidated Moodle Types
 * All Moodle-related TypeScript interfaces
 */

import { IdentificationSession } from '@/types/user-identification';

export interface MoodleConfig {
  moodleUrl: string;
  apiToken: string;
  enabled: boolean;
  autoLogin: boolean;
  requiredFields: {
    studentId: boolean;
    department: boolean;
  };
}

export interface MoodleUserInfo {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  department?: string;
  customfields?: Array<{
    shortname: string;
    value: string;
  }>;
}

export interface MoodleAuthResponse {
  success: boolean;
  user?: MoodleUserInfo;
  token?: string;
  error?: string;
}

export interface MoodleValidationError {
  field: string;
  message: string;
}

export interface MoodleSession extends IdentificationSession {
  moodleUserId: number;
  moodleToken: string;
}

export interface MoodleContextValue {
  // State
  isAuthenticated: boolean;
  currentUser: MoodleUserInfo | null;
  isAuthenticating: boolean;
  authError: string | null;
  config: MoodleConfig | null;
  
  // Actions
  authenticate: (credentials?: { username: string; password: string }) => Promise<MoodleAuthResponse>;
  logout: () => void;
  attemptAutoAuthentication: () => Promise<boolean>;
  resetAuthentication: () => void;
  
  // Utilities
  createIdentificationSession: (user: MoodleUserInfo) => IdentificationSession;
  validateMoodleConfig: (config: MoodleConfig) => { isValid: boolean; errors: string[] };
  
  // Error handling
  clearError: () => void;
}

export interface MoodleAuthHookProps {
  onSuccess: (session: IdentificationSession) => void;
  onError: (error: string) => void;
}

export interface MoodleAutoIdentificationProps {
  settings: any; // WidgetSettings
  onAutoIdentificationSuccess: (session: IdentificationSession) => void;
  onAutoIdentificationError?: (error: string) => void;
}