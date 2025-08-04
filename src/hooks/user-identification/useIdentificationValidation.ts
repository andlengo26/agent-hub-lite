/**
 * Hook for validating identification forms
 */

import { useCallback } from 'react';
import { IdentificationFormData, IdentificationValidationResult } from '@/types/user-identification';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface UseIdentificationValidationProps {
  settings: WidgetSettings | null;
}

export function useIdentificationValidation({ settings }: UseIdentificationValidationProps) {
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
      } else {
        // Allow both formats: 09989992746 and +639989992746
        const cleanMobile = formData.mobile.replace(/[\s\-\(\)]/g, '');
        const isValid = /^(\+63|0)[0-9]{10}$/.test(cleanMobile) || /^[\+]?[1-9][\d]{0,15}$/.test(cleanMobile);
        if (!isValid) {
          errors.mobile = 'Please enter a valid phone number (e.g., 09989992746 or +639989992746)';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      requiredFields
    };
  }, [settings]);

  return {
    validateForm
  };
}