/**
 * Core Type System - Foundation Types
 * Base types used across the entire application
 */

// ============= Base Entity Types =============

export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BaseEntityWithMeta extends BaseEntity {
  version?: number;
  metadata?: Record<string, any>;
}

// ============= Common Utility Types =============

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = any> {
  field: keyof T;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total?: number;
}

export interface FilterConfig<T = any> {
  field: keyof T;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
}

// ============= API Response Types =============

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============= Status and State Types =============

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface OperationState {
  isLoading: boolean;
  error: string | null;
  lastOperation?: string;
}

// ============= Configuration Types =============

export interface AppearanceConfig {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}

export interface DimensionsConfig {
  width: number;
  height: number;
  padding?: number;
  margin?: number;
}

// ============= Feature Flag Types =============

export type FeatureFlagValue = boolean | string | number;

export interface FeatureFlags {
  [key: string]: FeatureFlagValue;
}

// ============= Event System Types =============

export interface BaseEvent {
  type: string;
  timestamp: Date;
  source: string;
}

export interface UserEvent extends BaseEvent {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

// ============= Validation Types =============

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}