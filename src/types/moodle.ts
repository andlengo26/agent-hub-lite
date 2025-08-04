/**
 * Consolidated Moodle type definitions
 * Centralizes all Moodle-related interfaces to avoid duplication
 */

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