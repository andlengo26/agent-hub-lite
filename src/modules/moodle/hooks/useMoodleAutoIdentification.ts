/**
 * Moodle Auto-Identification Hook
 * Handles automatic user identification when widget loads
 */

import { useEffect, useCallback, useRef } from 'react';
import { MoodleAuthService } from '../services/MoodleAuthService';
import { IdentificationSession } from '@/types/user-identification';
import { useToast } from '@/hooks/use-toast';
import { MoodleAutoIdentificationProps } from '../types';

export function useMoodleAutoIdentification({
  settings,
  onAutoIdentificationSuccess,
  onAutoIdentificationError
}: MoodleAutoIdentificationProps) {
  const { toast } = useToast();
  const attemptedAutoAuth = useRef(false);

  const shouldAttemptAutoIdentification = useCallback((): boolean => {
    if (!settings?.userInfo || attemptedAutoAuth.current) return false;
    
    // Check if auto-identification is enabled
    const isMoodleAuthEnabled = settings.userInfo.enableMoodleAuth;
    const isMoodleChatPluginEnabled = settings.embed?.moodleChatPluginIntegration;
    const isAutoLoginEnabled = settings.integrations?.moodle?.autoLogin;
    
    // Auto-identification should happen if:
    // 1. Moodle auth is enabled
    // 2. Moodle chat plugin integration is enabled OR auto-login is enabled
    // 3. We're in a Moodle context OR this is a demo environment
    const isMoodleContext = MoodleAuthService.isMoodleContext();
    const isDemoEnvironment = window.location.pathname.includes('/settings/widget') || 
                             window.location.pathname.includes('/preview');
    
    const shouldAttempt = isMoodleAuthEnabled && 
                         (isMoodleChatPluginEnabled || isAutoLoginEnabled) &&
                         (isMoodleContext || isDemoEnvironment);
    
    return shouldAttempt;
  }, [settings]);

  const attemptAutoIdentification = useCallback(async (): Promise<boolean> => {
    if (!settings?.integrations?.moodle) {
      return false;
    }

    // Check if we're in demo environment
    const isDemoEnvironment = window.location.pathname.includes('/settings/widget') || 
                             window.location.pathname.includes('/preview');

    try {
      // Check if we already have a valid session
      const existingSession = localStorage.getItem('widget_user_identification');
      if (existingSession) {
        try {
          const session: IdentificationSession = JSON.parse(existingSession);
          const isSessionValid = session.isValid && 
            session.type === 'moodle_authentication' &&
            (new Date().getTime() - new Date(session.timestamp).getTime()) < 24 * 60 * 60 * 1000;
          
          if (isSessionValid) {
            onAutoIdentificationSuccess(session);
            return true;
          }
        } catch (error) {
          // Invalid session data, remove it
          localStorage.removeItem('widget_user_identification');
        }
      }

      // Validate Moodle configuration
      const configErrors = MoodleAuthService.validateConfig(settings.integrations.moodle);
      if (configErrors.length > 0) {
        console.warn('Moodle auto-identification skipped - configuration errors:', configErrors);
        return false;
      }

      // Attempt authentication
      let authResult = await MoodleAuthService.authenticateWithMoodle(settings.integrations.moodle);

      // For demo purposes, if authentication fails but we're in demo environment, create mock user
      if (!authResult.success && isDemoEnvironment) {
        console.log('Creating demo Moodle user for testing auto-identification');
        authResult = {
          success: true,
          user: {
            id: 12345,
            username: 'demo_student',
            firstname: 'Demo',
            lastname: 'Student',
            email: 'demo.student@university.edu',
            department: 'Computer Science',
            customfields: [
              { shortname: 'studentid', value: 'STU001234' }
            ]
          },
          token: 'demo_session_token_' + Date.now()
        };
      }

      if (!authResult.success || !authResult.user || !authResult.token) {
        console.log('Moodle auto-identification failed:', authResult.error || 'No user data');
        return false;
      }

      // Create identification session
      const session = MoodleAuthService.createIdentificationSession(
        authResult.user,
        authResult.token
      );

      // Store session
      localStorage.setItem('widget_user_identification', JSON.stringify(session));

      // Notify success
      onAutoIdentificationSuccess(session);
      
      console.log('Moodle auto-identification successful for user:', authResult.user.username);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-identification failed';
      console.warn('Moodle auto-identification error:', errorMessage);
      
      if (onAutoIdentificationError) {
        onAutoIdentificationError(errorMessage);
      }
      
      return false;
    }
  }, [settings, onAutoIdentificationSuccess, onAutoIdentificationError]);

  // Attempt auto-identification when settings are loaded and conditions are met
  useEffect(() => {
    if (!shouldAttemptAutoIdentification()) {
      return;
    }

    // Mark that we've attempted auto-auth to prevent repeated attempts
    attemptedAutoAuth.current = true;

    // Delay to ensure widget is fully initialized
    const timeoutId = setTimeout(() => {
      attemptAutoIdentification();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [shouldAttemptAutoIdentification, attemptAutoIdentification]);

  const resetAutoIdentification = useCallback(() => {
    attemptedAutoAuth.current = false;
  }, []);

  return {
    shouldAttemptAutoIdentification,
    attemptAutoIdentification,
    resetAutoIdentification
  };
}