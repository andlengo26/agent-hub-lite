/**
 * Core user identification hook - simplified and focused
 */

import { useState, useEffect, useCallback } from 'react';
import { IdentificationSession, UserIdentificationState } from '@/types/user-identification';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface UseUserIdentificationCoreProps {
  settings: WidgetSettings;
  onIdentificationComplete?: (session: IdentificationSession) => void;
}

export function useUserIdentificationCore({ settings, onIdentificationComplete }: UseUserIdentificationCoreProps) {
  const [state, setState] = useState<UserIdentificationState>({
    isRequired: false,
    isCompleted: false,
    showForm: false,
    formData: { name: '', email: '', mobile: '' },
    session: null,
    validationResult: null
  });

  const checkIdentificationRequired = useCallback((): boolean => {
    if (settings.userInfo.anonymousChat) return false;
    if (!settings.userInfo.enableUserIdentification) return false;
    
    const hasRequiredFields = Object.values(settings.userInfo.requiredFields).some(Boolean);
    const hasEnabledMethods = settings.userInfo.enableMoodleAuth || settings.userInfo.enableManualForm;
    
    return hasRequiredFields && hasEnabledMethods;
  }, [settings.userInfo]);

  const canSendMessage = useCallback((): boolean => {
    if (settings.userInfo.anonymousChat) return true;
    if (!settings.userInfo.enableUserIdentification) return true;
    return state.isCompleted && state.session !== null;
  }, [settings.userInfo.anonymousChat, settings.userInfo.enableUserIdentification, state.isCompleted, state.session]);

  return {
    ...state,
    canSendMessage,
    checkIdentificationRequired
  };
}