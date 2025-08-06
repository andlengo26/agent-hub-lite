/**
 * Consolidated Moodle Provider
 * Single context provider for all Moodle functionality
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { MoodleAuthService } from '../services/MoodleAuthService';
import { MoodleConfig, MoodleUserInfo, MoodleAuthResponse, MoodleContextValue } from '../types';
import { IdentificationSession } from '@/types/user-identification';
import { logger } from '@/lib/logger';

export const MoodleContext = createContext<MoodleContextValue | null>(null);

interface MoodleProviderProps {
  children: React.ReactNode;
  config: MoodleConfig | null;
  onAuthSuccess?: (session: IdentificationSession) => void;
  onAuthError?: (error: string) => void;
}

export function MoodleProvider({
  children,
  config,
  onAuthSuccess,
  onAuthError
}: MoodleProviderProps) {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<MoodleUserInfo | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Actions
  const authenticate = useCallback(async (credentials?: { username: string; password: string }): Promise<MoodleAuthResponse> => {
    if (!config?.enabled) {
      const error = 'Moodle integration is not enabled';
      setAuthError(error);
      onAuthError?.(error);
      return { success: false, error };
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await MoodleAuthService.authenticateWithMoodle(config);
      
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        // Create identification session
        const session = createIdentificationSession(response.user);
        onAuthSuccess?.(session);
        
        return response;
      } else {
        const error = response.error || 'Authentication failed';
        setAuthError(error);
        onAuthError?.(error);
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error';
      setAuthError(errorMessage);
      onAuthError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsAuthenticating(false);
    }
  }, [config, onAuthSuccess, onAuthError]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthError(null);
    MoodleAuthService.clearMoodleSession();
  }, []);

  const attemptAutoAuthentication = useCallback(async (): Promise<boolean> => {
    if (!config?.enabled || !config?.autoLogin) {
      return false;
    }

    try {
      const response = await authenticate();
      return response.success;
    } catch (error) {
      logger.error('Auto-authentication failed', error);
      return false;
    }
  }, [config, authenticate]);

  const resetAuthentication = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAuthenticating(false);
    setAuthError(null);
  }, []);

  const createIdentificationSession = useCallback((user: MoodleUserInfo): IdentificationSession => {
    return {
      id: `moodle_${user.id}_${Date.now()}`,
      type: 'moodle_authentication',
      userData: {
        name: `${user.firstname} ${user.lastname}`.trim(),
        email: user.email,
        studentId: user.username,
        department: user.department,
        customFields: user.customfields?.reduce((acc, field) => {
          acc[field.shortname] = field.value;
          return acc;
        }, {} as Record<string, string>)
      },
      timestamp: new Date(),
      isValid: true,
      sessionToken: `moodle_token_${user.id}`
    };
  }, []);

  const validateMoodleConfig = useCallback((configToValidate: MoodleConfig) => {
    const errors: string[] = [];
    
    if (!configToValidate.moodleUrl) {
      errors.push('Moodle URL is required');
    } else if (!configToValidate.moodleUrl.startsWith('http')) {
      errors.push('Moodle URL must start with http:// or https://');
    }
    
    if (!configToValidate.apiToken) {
      errors.push('API token is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Auto-authentication on mount if enabled
  useEffect(() => {
    if (config?.enabled && config?.autoLogin && !isAuthenticated) {
      attemptAutoAuthentication();
    }
  }, [config, isAuthenticated, attemptAutoAuthentication]);

  const contextValue: MoodleContextValue = {
    // State
    isAuthenticated,
    currentUser,
    isAuthenticating,
    authError,
    config,
    
    // Actions
    authenticate,
    logout,
    attemptAutoAuthentication,
    resetAuthentication,
    
    // Utilities
    createIdentificationSession,
    validateMoodleConfig,
    
    // Error handling
    clearError
  };

  return (
    <MoodleContext.Provider value={contextValue}>
      {children}
    </MoodleContext.Provider>
  );
}