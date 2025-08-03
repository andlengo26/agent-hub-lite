/**
 * Hook for managing user identification in the chat widget
 * Handles manual form submission and future Moodle authentication
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
  UserIdentificationState,
  MoodleConfig
} from '@/types/user-identification';

interface UseUserIdentificationProps {
  settings: WidgetSettings | null;
  onIdentificationComplete?: (session: IdentificationSession) => void;
}

const IDENTIFICATION_STORAGE_KEY = 'widget_user_identification';

export function useUserIdentification({ settings, onIdentificationComplete }: UseUserIdentificationProps) {
  const { toast } = useToast();
  
  const [state, setState] = useState<UserIdentificationState>({
    isRequired: false,
    isCompleted: false,
    showForm: false,
    formData: { name: '', email: '', mobile: '' },
    session: null,
    validationResult: null
  });

  // Get the identification method priority based on settings
  const getIdentificationMethodPriority = useCallback(() => {
    if (!settings?.userInfo) return { methods: [], prioritizeMoodle: false };
    
    const { enableMoodleAuth, enableManualForm } = settings.userInfo;
    const moodleChatPluginEnabled = settings.embed?.moodleChatPluginIntegration;
    
    const methods = [];
    
    if (enableMoodleAuth) methods.push('moodle_authentication');
    if (enableManualForm) methods.push('manual_form_submission');
    
    // If Moodle Chat Plugin integration is enabled, prioritize Moodle authentication
    const prioritizeMoodle = moodleChatPluginEnabled && enableMoodleAuth;
    
    return { methods, prioritizeMoodle };
  }, [settings]);

  // Check if identification is required based on settings
  const checkIdentificationRequired = useCallback(() => {
    if (!settings?.userInfo) return false;
    
    const { anonymousChat, enableUserIdentification } = settings.userInfo;
    
    // If anonymous chat is enabled, no identification required
    if (anonymousChat) return false;
    
    // If user identification is disabled, no identification required
    if (enableUserIdentification === false) return false;
    
    // If Moodle Chat Plugin integration is enabled, always require identification
    if (settings.embed?.moodleChatPluginIntegration) return true;
    
    // Otherwise, check if any identification method is enabled
    const { enableMoodleAuth, enableManualForm } = settings.userInfo;
    return enableMoodleAuth || enableManualForm;
  }, [settings]);

  // Load existing session from storage
  useEffect(() => {
    const savedSession = localStorage.getItem(IDENTIFICATION_STORAGE_KEY);
    if (savedSession) {
      try {
        const session: IdentificationSession = JSON.parse(savedSession);
        // Validate session is still fresh (24 hours)
        const isSessionValid = session.isValid && 
          (new Date().getTime() - new Date(session.timestamp).getTime()) < 24 * 60 * 60 * 1000;
        
        if (isSessionValid) {
          setState(prev => ({
            ...prev,
            isCompleted: true,
            session,
            isRequired: checkIdentificationRequired()
          }));
        } else {
          localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to load identification session:', error);
        localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
      }
    }
  }, [checkIdentificationRequired]);

  // Update required status when settings change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isRequired: checkIdentificationRequired()
    }));
  }, [checkIdentificationRequired]);

  // Validate form data
  const validateForm = useCallback((formData: IdentificationFormData): IdentificationValidationResult => {
    const errors: Record<string, string> = {};
    const requiredFields: string[] = [];

    if (!settings?.userInfo) {
      return { isValid: false, errors, requiredFields };
    }

    const { requiredFields: fields } = settings.userInfo;

    if (fields.name) {
      requiredFields.push('name');
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
    }

    if (fields.email) {
      requiredFields.push('email');
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (fields.mobile) {
      requiredFields.push('mobile');
      if (!formData.mobile.trim()) {
        errors.mobile = 'Phone number is required';
      } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/[\s\-\(\)]/g, ''))) {
        errors.mobile = 'Please enter a valid phone number';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      requiredFields
    };
  }, [settings]);

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
      localStorage.setItem(IDENTIFICATION_STORAGE_KEY, JSON.stringify(session));

      // Update state
      setState(prev => ({
        ...prev,
        isCompleted: true,
        showForm: false,
        session,
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
      localStorage.setItem(IDENTIFICATION_STORAGE_KEY, JSON.stringify(session));

      // Update state
      setState(prev => ({
        ...prev,
        isCompleted: true,
        session,
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
    localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
    setState(prev => ({
      ...prev,
      isCompleted: false,
      session: null,
      formData: { name: '', email: '', mobile: '' },
      validationResult: null
    }));
  }, []);

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
    
    // Utils
    getUserContext,
    canSendMessage,
    validateForm: () => validateForm(state.formData),
    getIdentificationMethodPriority
  };
}