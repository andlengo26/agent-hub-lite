/**
 * Main hook for managing user identification in the chat widget
 * Refactored to use modular sub-hooks for better maintainability
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { MoodleAuthService } from '@/services/moodleAuthService';
import {
  IdentificationType,
  UserIdentificationData,
  IdentificationSession,
  IdentificationFormData,
  IdentificationValidationResult,
  UserIdentificationState
} from '@/types/user-identification';
import { MoodleConfig } from '@/types/moodle';
import { useIdentificationSession } from './user-identification/useIdentificationSession';
import { useIdentificationValidation } from './user-identification/useIdentificationValidation';
import { useIdentificationRequirements } from './user-identification/useIdentificationRequirements';

interface UseUserIdentificationProps {
  settings: WidgetSettings | null;
  onIdentificationComplete?: (session: IdentificationSession) => void;
}

export function useUserIdentification({ settings, onIdentificationComplete }: UseUserIdentificationProps) {
  const { toast } = useToast();
  
  // Use modular sub-hooks
  const { isRequired, getIdentificationMethodPriority } = useIdentificationRequirements({ settings });
  const { validateForm } = useIdentificationValidation({ settings });
  const { session, saveSession, clearSession } = useIdentificationSession({
    onSessionLoaded: (loadedSession) => {
      setState(prev => ({
        ...prev,
        isCompleted: true,
        session: loadedSession
      }));
    }
  });
  
  const [state, setState] = useState<UserIdentificationState>({
    isRequired,
    isCompleted: !!session,
    showForm: false,
    formData: { name: '', email: '', mobile: '' },
    session,
    validationResult: null
  });

  // Update required status when settings change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isRequired,
      session,
      isCompleted: !!session
    }));
  }, [isRequired, session]);


  // Show identification form
  const showIdentificationForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: true,
      formData: { name: '', email: '', mobile: '' },
      validationResult: null
    }));
  }, []);

  // Hide identification form
  const hideIdentificationForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: false,
      validationResult: null
    }));
  }, []);

  // Update form data
  const updateFormData = useCallback((field: keyof IdentificationFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      validationResult: null // Clear validation when user types
    }));
  }, []);

  // Submit manual form identification
  const submitManualIdentification = useCallback(async (): Promise<boolean> => {
    const validationResult = validateForm(state.formData);
    
    setState(prev => ({
      ...prev,
      validationResult
    }));

    if (!validationResult.isValid) {
      return false;
    }

    try {
      // Create identification session
      const session: IdentificationSession = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'manual_form_submission' as IdentificationType,
        userData: {
          name: state.formData.name || undefined,
          email: state.formData.email || undefined,
          mobile: state.formData.mobile || undefined
        },
        timestamp: new Date(),
        isValid: true
      };

      // Save to storage
      saveSession(session);

      // Update state
      setState(prev => ({
        ...prev,
        isCompleted: true,
        showForm: false,
        validationResult: null
      }));

      // Notify completion
      onIdentificationComplete?.(session);

      toast({
        title: "Identification Complete",
        description: "Thank you for providing your information.",
      });

      return true;
    } catch (error) {
      console.error('Failed to submit identification:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [state.formData, validateForm, onIdentificationComplete, toast]);

  // Submit Moodle authentication
  const submitMoodleAuthentication = useCallback(async (moodleConfig: MoodleConfig): Promise<boolean> => {
    try {
      // Check if we're in a Moodle context
      if (!MoodleAuthService.isMoodleContext()) {
        toast({
          title: "Error",
          description: "Moodle context not detected. Please ensure you are accessing this from within Moodle.",
          variant: "destructive"
        });
        return false;
      }

      // Attempt authentication
      const authResult = await MoodleAuthService.authenticateWithMoodle(moodleConfig);

      if (!authResult.success) {
        toast({
          title: "Authentication Failed",
          description: authResult.error || "Failed to authenticate with Moodle",
          variant: "destructive"
        });
        return false;
      }

      if (!authResult.user || !authResult.token) {
        toast({
          title: "Error",
          description: "Invalid authentication response from Moodle",
          variant: "destructive"
        });
        return false;
      }

      // Create identification session
      const session = MoodleAuthService.createIdentificationSession(
        authResult.user,
        authResult.token
      );

      // Save to storage
      saveSession(session);

      // Update state
      setState(prev => ({
        ...prev,
        isCompleted: true,
        validationResult: null
      }));

      // Notify completion
      onIdentificationComplete?.(session);

      toast({
        title: "Authentication Successful",
        description: `Welcome ${authResult.user.firstname} ${authResult.user.lastname}!`,
      });

      return true;
    } catch (error) {
      console.error('Moodle authentication error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate with Moodle. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [onIdentificationComplete, toast]);

  // Clear identification session
  const clearIdentification = useCallback(() => {
    clearSession();
    setState(prev => ({
      ...prev,
      isCompleted: false,
      formData: { name: '', email: '', mobile: '' },
      validationResult: null
    }));
  }, [clearSession]);

  // Set identification session (for auto-identification)
  const setIdentificationSession = useCallback((session: IdentificationSession) => {
    saveSession(session);
    setState(prev => ({
      ...prev,
      isCompleted: true
    }));
  }, [saveSession]);

  // Get user context for AI prompts
  const getUserContext = useCallback((): string => {
    if (!state.session?.userData) return '';
    
    const userData = state.session.userData;
    const context = [];
    
    if (userData.name) context.push(`Name: ${userData.name}`);
    if (userData.email) context.push(`Email: ${userData.email}`);
    if (userData.mobile) context.push(`Phone: ${userData.mobile}`);
    
    return context.length > 0 
      ? `User Information - ${context.join(', ')} (Identification Type: ${state.session.type})`
      : '';
  }, [state.session]);

  // Check if user can send messages (identification check)
  const canSendMessage = useCallback((): boolean => {
    if (!state.isRequired) return true;
    return state.isCompleted;
  }, [state.isRequired, state.isCompleted]);

  return {
    // State
    isRequired: state.isRequired,
    isCompleted: state.isCompleted,
    showForm: state.showForm,
    formData: state.formData,
    session: state.session,
    validationResult: state.validationResult,
    
    // Actions
    showIdentificationForm,
    hideIdentificationForm,
    updateFormData,
    submitManualIdentification,
    submitMoodleAuthentication,
    clearIdentification,
    setIdentificationSession,
    
    // Utils
    getUserContext,
    canSendMessage,
    validateForm: () => validateForm(state.formData),
    getIdentificationMethodPriority
  };
}