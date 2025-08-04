/**
 * Hook for managing identification form logic
 * Extracted from useUserIdentification to improve modularity
 */

import { useState, useCallback } from 'react';
import { IdentificationFormData, IdentificationValidationResult, IdentificationSession } from '@/types/user-identification';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface UseIdentificationFormProps {
  settings: WidgetSettings;
  onSuccess: (session: IdentificationSession) => void;
}

export function useIdentificationForm({ settings, onSuccess }: UseIdentificationFormProps) {
  const [formData, setFormData] = useState<IdentificationFormData>({
    name: '',
    email: '',
    mobile: ''
  });
  const [validationResult, setValidationResult] = useState<IdentificationValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((data: IdentificationFormData): IdentificationValidationResult => {
    const errors: Record<string, string> = {};
    const requiredFields: string[] = [];

    if (settings.userInfo.requiredFields.name) {
      requiredFields.push('name');
      if (!data.name.trim()) {
        errors.name = 'Name is required';
      }
    }

    if (settings.userInfo.requiredFields.email) {
      requiredFields.push('email');
      if (!data.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (settings.userInfo.requiredFields.mobile) {
      requiredFields.push('mobile');
      if (!data.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
      } else if (!/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/.test(data.mobile)) {
        errors.mobile = 'Please enter a valid mobile number';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      requiredFields
    };
  }, [settings.userInfo.requiredFields]);

  const updateFormData = useCallback((field: keyof IdentificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationResult && validationResult.errors[field]) {
      setValidationResult(prev => prev ? {
        ...prev,
        errors: { ...prev.errors, [field]: '' }
      } : null);
    }
  }, [validationResult]);

  const submitForm = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const validation = validateForm(formData);
      setValidationResult(validation);

      if (!validation.isValid) {
        return false;
      }

      // Create identification session
      const session: IdentificationSession = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'manual_form_submission',
        userData: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile
        },
        timestamp: new Date(),
        isValid: true
      };

      // Store session
      localStorage.setItem('widget_user_identification', JSON.stringify(session));
      
      onSuccess(session);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSuccess]);

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', mobile: '' });
    setValidationResult(null);
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    validationResult,
    isSubmitting,
    updateFormData,
    submitForm,
    resetForm,
    validateForm
  };
}