/**
 * Hook for managing identification session storage and lifecycle
 */

import { useState, useEffect, useCallback } from 'react';
import { IdentificationSession } from '@/types/user-identification';

const IDENTIFICATION_STORAGE_KEY = 'widget_user_identification';

interface UseIdentificationSessionProps {
  onSessionLoaded?: (session: IdentificationSession) => void;
}

export function useIdentificationSession({ onSessionLoaded }: UseIdentificationSessionProps = {}) {
  const [session, setSession] = useState<IdentificationSession | null>(null);

  // Load existing session from storage
  useEffect(() => {
    const savedSession = localStorage.getItem(IDENTIFICATION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsedSession: IdentificationSession = JSON.parse(savedSession);
        // Validate session is still fresh (24 hours)
        const isSessionValid = parsedSession.isValid && 
          (new Date().getTime() - new Date(parsedSession.timestamp).getTime()) < 24 * 60 * 60 * 1000;
        
        if (isSessionValid) {
          setSession(parsedSession);
          onSessionLoaded?.(parsedSession);
        } else {
          localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to load identification session:', error);
        localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
      }
    }
  }, []); // Remove onSessionLoaded from dependencies to prevent infinite loop

  const saveSession = useCallback((newSession: IdentificationSession) => {
    localStorage.setItem(IDENTIFICATION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(IDENTIFICATION_STORAGE_KEY);
    setSession(null);
  }, []);

  return {
    session,
    saveSession,
    clearSession
  };
}