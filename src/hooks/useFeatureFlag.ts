/**
 * Feature flag hook for conditional rendering and functionality
 * Provides type-safe access to feature flags with logging
 */

import React, { useMemo } from 'react';
import { featureFlags } from '../lib/config';
import { logger } from '../lib/logger';

export type FeatureFlag = keyof typeof featureFlags;

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const isEnabled = useMemo(() => {
    const enabled = featureFlags[flag];
    logger.featureFlag(flag, enabled);
    return enabled;
  }, [flag]);

  return isEnabled;
}

export function useFeatureFlags(): typeof featureFlags {
  return featureFlags;
}

// Higher-order component for conditional rendering
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flag: FeatureFlag,
  fallback?: React.ComponentType<P> | null
) {
  return function FeatureFlaggedComponent(props: P) {
    const isEnabled = useFeatureFlag(flag);
    
    if (!isEnabled) {
      return fallback ? React.createElement(fallback, props) : null;
    }
    
    return React.createElement(Component, props);
  };
}