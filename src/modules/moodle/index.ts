/**
 * Consolidated Moodle Integration Module
 * Single entry point for all Moodle-related functionality
 */

// Core services
export { MoodleAuthService } from './services/MoodleAuthService';
export { MoodleConfigService } from './services/MoodleConfigService';

// Hooks
export { useMoodle } from './hooks/useMoodle';
export { useMoodleAuth } from './hooks/useMoodleAuth';
export { useMoodleAutoIdentification } from './hooks/useMoodleAutoIdentification';

// Components
export { MoodleProvider } from './components/MoodleProvider';
export { MoodleLoginButton } from './components/MoodleLoginButton';
export { MoodleReLoginPrompt } from './components/MoodleReLoginPrompt';
export { MoodleConfigPanel } from './components/MoodleConfigPanel';

// Types
export type {
  MoodleConfig,
  MoodleUserInfo,
  MoodleAuthResponse,
  MoodleValidationError,
  MoodleSession
} from './types';

// Utils
export { MoodleUtils } from './utils/MoodleUtils';