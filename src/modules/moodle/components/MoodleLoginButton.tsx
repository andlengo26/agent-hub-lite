/**
 * Consolidated Moodle Login Button
 * Uses the unified Moodle service
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MoodleAuthService } from '../services/MoodleAuthService';
import { MoodleConfig } from '../types';
import { IdentificationSession } from '@/types/user-identification';

interface MoodleLoginButtonProps {
  config: MoodleConfig;
  onAuthSuccess: (session: IdentificationSession) => void;
  onAuthError: (error: string) => void;
  appearance: {
    primaryColor: string;
    textColor: string;
  };
  disabled?: boolean;
}

export function MoodleLoginButton({
  config,
  onAuthSuccess,
  onAuthError,
  appearance,
  disabled = false
}: MoodleLoginButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodleLogin = async () => {
    if (!config.enabled || disabled) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      // Check if we're in a Moodle context
      if (!MoodleAuthService.isMoodleContext()) {
        throw new Error('Moodle context not detected. Please ensure you are accessing this from within Moodle.');
      }

      // Attempt authentication
      const authResult = await MoodleAuthService.authenticateWithMoodle(config);

      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      if (!authResult.user || !authResult.token) {
        throw new Error('Invalid authentication response');
      }

      // Create identification session
      const session = MoodleAuthService.createIdentificationSession(
        authResult.user,
        authResult.token
      );

      // Store session
      localStorage.setItem('widget_user_identification', JSON.stringify(session));

      onAuthSuccess(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
      onAuthError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleMoodleLogin}
        disabled={disabled || isAuthenticating || !config.enabled}
        className="w-full"
        style={{
          backgroundColor: appearance.primaryColor,
          color: appearance.textColor,
          borderColor: appearance.primaryColor
        }}
        variant="default"
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login with Moodle
          </>
        )}
      </Button>

      {config.enabled && (
        <p className="text-xs text-gray-500 text-center">
          Sign in using your Moodle account to continue
        </p>
      )}
    </div>
  );
}