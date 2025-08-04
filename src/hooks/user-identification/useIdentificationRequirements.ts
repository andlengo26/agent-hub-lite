/**
 * Hook for checking identification requirements based on widget settings
 */

import { useCallback, useMemo } from 'react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface UseIdentificationRequirementsProps {
  settings: WidgetSettings | null;
}

export function useIdentificationRequirements({ settings }: UseIdentificationRequirementsProps) {
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

  const isRequired = useMemo(() => checkIdentificationRequired(), [checkIdentificationRequired]);

  return {
    isRequired,
    checkIdentificationRequired,
    getIdentificationMethodPriority
  };
}
