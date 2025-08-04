/**
 * Re-export all user identification hooks from this module
 */

export { useIdentificationSession } from './useIdentificationSession';
export { useIdentificationValidation } from './useIdentificationValidation';
export { useIdentificationRequirements } from './useIdentificationRequirements';

// Re-export the main hook for backward compatibility
export { useUserIdentification } from '../useUserIdentification';