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

  return {
    validateForm
  };
}