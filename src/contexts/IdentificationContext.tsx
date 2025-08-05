/**
 * Unified Identification Provider
 * Consolidates all user identification logic into a single context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useIdentificationSession } from '@/hooks/user-identification/useIdentificationSession';
import { useIdentificationValidation } from '@/hooks/user-identification/useIdentificationValidation';
import { useIdentificationRequirements } from '@/hooks/user-identification/useIdentificationRequirements';
import { useMoodleAutoIdentification } from '@/modules/moodle/hooks/useMoodleAutoIdentification';
import { CustomerService } from '@/services/customerService';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import {
  IdentificationSession,
  IdentificationFormData,
  IdentificationValidationResult,
  UserIdentificationState,
  IdentificationType
} from '@/types/user-identification';

interface IdentificationContextValue extends UserIdentificationState {
  // Core actions
  showIdentificationForm: () => void;
  hideIdentificationForm: () => void;
  updateFormData: (field: keyof IdentificationFormData, value: string) => void;
  submitManualIdentification: () => Promise<boolean>;
  submitMoodleAuthentication: (session: IdentificationSession) => Promise<boolean>;
  clearIdentification: () => void;
  setIdentificationSession: (session: IdentificationSession) => void;
  
  // Utility functions
  getUserContext: () => string;
  canSendMessage: () => boolean;
  getIdentificationMethodPriority: () => {
    methods: IdentificationType[];
    prioritizeMoodle: boolean;
  };
  
  // Auto-identification
  attemptAutoIdentification: () => Promise<boolean>;
  resetAutoIdentification: () => void;
  
  // Settings
  settings: WidgetSettings | null;
}

const IdentificationContext = createContext<IdentificationContextValue | null>(null);

interface IdentificationProviderProps {
  children: React.ReactNode;
  settings: WidgetSettings | null;
  onIdentificationComplete?: (session: IdentificationSession) => void;
}

export function IdentificationProvider({
  children,
  settings,
  onIdentificationComplete
}: IdentificationProviderProps) {
  // Core state
  const [isCompleted, setIsCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<IdentificationFormData>({
    name: '',
    email: '',
    mobile: ''
  });

  // Initialize sub-hooks
  const { session, saveSession, clearSession } = useIdentificationSession({
    onSessionLoaded: (loadedSession) => {
      setIsCompleted(true);
      onIdentificationComplete?.(loadedSession);
    }
  });

  const { validateForm } = useIdentificationValidation({ settings });
  const { isRequired, getIdentificationMethodPriority } = useIdentificationRequirements({ settings });

  // Auto-identification for Moodle
  const moodleAutoIdentification = useMoodleAutoIdentification({
    settings,
    onAutoIdentificationSuccess: async (session) => {
      await handleIdentificationSuccess(session);
    },
    onAutoIdentificationError: (error) => {
      console.log('Moodle auto-identification failed:', error);
    }
  });

  // Validation state
  const [validationResult, setValidationResult] = useState<IdentificationValidationResult | null>(null);

  // Handle successful identification
  const handleIdentificationSuccess = useCallback(async (identificationSession: IdentificationSession) => {
    try {
      // Save session
      saveSession(identificationSession);
      setIsCompleted(true);
      setShowForm(false);
      setValidationResult(null);

      // Create customer record
      await CustomerService.createCustomerFromIdentification(identificationSession);
      console.log('Customer created from identification session:', identificationSession.id);

      // Notify parent
      onIdentificationComplete?.(identificationSession);
      
      return true;
    } catch (error) {
      console.error('Failed to complete identification:', error);
      return false;
    }
  }, [saveSession, onIdentificationComplete]);

  // Core actions
  const showIdentificationForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const hideIdentificationForm = useCallback(() => {
    setShowForm(false);
    setValidationResult(null);
  }, []);

  const updateFormData = useCallback((field: keyof IdentificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field
    if (validationResult?.errors[field]) {
      setValidationResult(prev => prev ? {
        ...prev,
        errors: { ...prev.errors, [field]: '' }
      } : null);
    }
  }, [validationResult]);

  const submitManualIdentification = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    // Validate form
    const validation = validateForm(formData);
    setValidationResult(validation);

    if (!validation.isValid) {
      return false;
    }

    // Create identification session
    const identificationSession: IdentificationSession = {
      id: `manual_${Date.now()}`,
      type: 'manual_form_submission',
      userData: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile
      },
      timestamp: new Date(),
      isValid: true
    };

    return await handleIdentificationSuccess(identificationSession);
  }, [settings, validateForm, formData, handleIdentificationSuccess]);

  const submitMoodleAuthentication = useCallback(async (moodleSession: IdentificationSession): Promise<boolean> => {
    return await handleIdentificationSuccess(moodleSession);
  }, [handleIdentificationSuccess]);

  const clearIdentification = useCallback(() => {
    clearSession();
    setIsCompleted(false);
    setShowForm(false);
    setFormData({ name: '', email: '', mobile: '' });
    setValidationResult(null);
  }, [clearSession]);

  const setIdentificationSession = useCallback((newSession: IdentificationSession) => {
    handleIdentificationSuccess(newSession);
  }, [handleIdentificationSuccess]);

  // Utility functions
  const getUserContext = useCallback((): string => {
    if (!session?.userData) return '';
    
    const { userData } = session;
    const contextParts = [];
    
    if (userData.name) contextParts.push(`User: ${userData.name}`);
    if (userData.email) contextParts.push(`Email: ${userData.email}`);
    if (userData.studentId) contextParts.push(`Student ID: ${userData.studentId}`);
    if (userData.department) contextParts.push(`Department: ${userData.department}`);
    
    return contextParts.join(', ');
  }, [session]);

  const canSendMessage = useCallback((): boolean => {
    // If identification is not required, allow sending
    if (!isRequired) return true;
    
    // If identification is required, check if it's completed
    return isCompleted && !!session;
  }, [isRequired, isCompleted, session]);

  // Auto-identification methods
  const attemptAutoIdentification = useCallback(async (): Promise<boolean> => {
    return await moodleAutoIdentification.attemptAutoIdentification();
  }, [moodleAutoIdentification]);

  const resetAutoIdentification = useCallback(() => {
    moodleAutoIdentification.resetAutoIdentification();
  }, [moodleAutoIdentification]);

  // Effect to check if identification is completed on mount
  useEffect(() => {
    if (session && session.isValid) {
      setIsCompleted(true);
    }
  }, [session]);

  // Context value
  const contextValue: IdentificationContextValue = {
    // State
    isRequired,
    isCompleted,
    showForm,
    formData,
    session,
    validationResult,
    
    // Actions
    showIdentificationForm,
    hideIdentificationForm,
    updateFormData,
    submitManualIdentification,
    submitMoodleAuthentication,
    clearIdentification,
    setIdentificationSession,
    
    // Utilities
    getUserContext,
    canSendMessage,
    getIdentificationMethodPriority,
    
    // Auto-identification
    attemptAutoIdentification,
    resetAutoIdentification,
    
    // Settings
    settings
  };

  return (
    <IdentificationContext.Provider value={contextValue}>
      {children}
    </IdentificationContext.Provider>
  );
}

export function useIdentification() {
  const context = useContext(IdentificationContext);
  if (!context) {
    throw new Error('useIdentification must be used within an IdentificationProvider');
  }
  return context;
}