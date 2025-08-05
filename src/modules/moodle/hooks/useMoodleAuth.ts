/**
 * Moodle Authentication Hook
 * Simplified auth hook using the consolidated service
 */

import { useCallback } from 'react';
import { MoodleAuthService } from '../services/MoodleAuthService';
import { MoodleConfig } from '../types';
import { IdentificationSession } from '@/types/user-identification';
import { MoodleAuthHookProps } from '../types';

export function useMoodleAuth({ onSuccess, onError }: MoodleAuthHookProps) {
  
  const authenticateWithMoodle = useCallback(async (moodleConfig: MoodleConfig): Promise<boolean> => {
    try {
      // Validate configuration
      const configErrors = MoodleAuthService.validateConfig(moodleConfig);
      if (configErrors.length > 0) {
        onError(`Configuration errors: ${configErrors.join(', ')}`);
        return false;
      }

      // Check if we're in a Moodle context
      if (!MoodleAuthService.isMoodleContext()) {
        onError('Moodle context not detected. Please ensure you are accessing this from within Moodle.');
        return false;
      }

      // Attempt authentication
      const authResult = await MoodleAuthService.authenticateWithMoodle(moodleConfig);

      if (!authResult.success) {
        onError(authResult.error || 'Authentication failed');
        return false;
      }

      if (!authResult.user || !authResult.token) {
        onError('Invalid authentication response');
        return false;
      }

      // Create identification session
      const session = MoodleAuthService.createIdentificationSession(
        authResult.user,
        authResult.token
      );

      // Store session
      localStorage.setItem('widget_user_identification', JSON.stringify(session));

      onSuccess(session);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      onError(errorMessage);
      return false;
    }
  }, [onSuccess, onError]);

  const checkMoodleContext = useCallback((): boolean => {
    return MoodleAuthService.isMoodleContext();
  }, []);

  const validateMoodleConfig = useCallback((config: Partial<MoodleConfig>): string[] => {
    return MoodleAuthService.validateConfig(config);
  }, []);

  return {
    authenticateWithMoodle,
    checkMoodleContext,
    validateMoodleConfig
  };
}