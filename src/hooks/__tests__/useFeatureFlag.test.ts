/**
 * Test suite for useFeatureFlag hook
 */

import { renderHook } from '@testing-library/react';
import { useFeatureFlag, useFeatureFlags } from '../useFeatureFlag';

// Mock the config module
jest.mock('@/lib/config', () => ({
  featureFlags: {
    chat: true,
    analytics: false,
    multiTenant: false,
    realTime: false,
    aiLifecycle: true,
  },
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    featureFlag: jest.fn(),
  },
}));

describe('useFeatureFlag', () => {
  it('returns correct flag value for enabled feature', () => {
    const { result } = renderHook(() => useFeatureFlag('chat'));
    expect(result.current).toBe(true);
  });

  it('returns correct flag value for disabled feature', () => {
    const { result } = renderHook(() => useFeatureFlag('analytics'));
    expect(result.current).toBe(false);
  });

  it('returns correct flag value for aiLifecycle feature', () => {
    const { result } = renderHook(() => useFeatureFlag('aiLifecycle'));
    expect(result.current).toBe(true);
  });

  it('logs feature flag usage', () => {
    const { logger } = require('@/lib/logger');
    renderHook(() => useFeatureFlag('chat'));
    expect(logger.featureFlag).toHaveBeenCalledWith('chat', true);
  });
});

describe('useFeatureFlags', () => {
  it('returns all feature flags', () => {
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current).toEqual({
      chat: true,
      analytics: false,
      multiTenant: false,
      realTime: false,
      aiLifecycle: true,
    });
  });
});