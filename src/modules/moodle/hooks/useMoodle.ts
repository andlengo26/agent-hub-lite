/**
 * Consolidated Moodle Hook
 * Main hook for Moodle functionality
 */

import { useContext } from 'react';
import { MoodleContext } from '../components/MoodleProvider';
import { MoodleContextValue } from '../types';

export function useMoodle(): MoodleContextValue {
  const context = useContext(MoodleContext);
  if (!context) {
    throw new Error('useMoodle must be used within a MoodleProvider');
  }
  return context;
}