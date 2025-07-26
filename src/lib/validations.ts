/**
 * Validation schemas using Zod
 * Provides type-safe form validation for the admin interface
 */

import { z } from 'zod';

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long').optional(),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

// User validation schemas
export const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'agent', 'manager']).default('agent'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'agent', 'manager']).optional(),
  onlineStatus: z.enum(['online', 'offline', 'away']).optional(),
});

// Type exports
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;