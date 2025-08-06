/**
 * API related type definitions
 * Replaces generic 'any' types with specific interfaces
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationOptions<TData = unknown, TVariables = unknown> {
  orgId?: string;
  data?: TData;
  variables?: TVariables;
}

export interface ApiRequestConfig {
  method: string;
  url: string;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
}