/**
 * User identification types for the chat widget
 */

export type IdentificationType = 'manual_form_submission' | 'moodle_authentication';

export interface UserIdentificationData {
  name?: string;
  email?: string;
  mobile?: string;
  studentId?: string; // Moodle username/student ID
  department?: string;
  customFields?: Record<string, string>;
}

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

export interface IdentificationSession {
  id: string;
  type: IdentificationType;
  userData: UserIdentificationData;
  timestamp: Date;
  isValid: boolean;
  sessionToken?: string; // For authenticated sessions
}

export interface IdentificationFormData {
  name: string;
  email: string;
  mobile: string;
}

export interface IdentificationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  requiredFields: string[];
}

export interface UserIdentificationState {
  isRequired: boolean;
  isCompleted: boolean;
  showForm: boolean;
  formData: IdentificationFormData;
  session: IdentificationSession | null;
  validationResult: IdentificationValidationResult | null;
}