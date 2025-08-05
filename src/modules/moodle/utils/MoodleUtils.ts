/**
 * Moodle Utility Functions
 * Helper functions for Moodle integration
 */

import { MoodleConfig, MoodleUserInfo } from '../types';
import { IdentificationSession } from '@/types/user-identification';

export class MoodleUtils {
  /**
   * Check if we're running in a demo environment
   */
  static isDemoEnvironment(): boolean {
    return window.location.pathname.includes('/settings/widget') || 
           window.location.pathname.includes('/preview') ||
           window.location.hostname === 'localhost';
  }

  /**
   * Create demo Moodle user for testing
   */
  static createDemoUser(): MoodleUserInfo {
    return {
      id: 12345,
      username: 'demo_student',
      firstname: 'Demo',
      lastname: 'Student',
      email: 'demo.student@university.edu',
      department: 'Computer Science',
      customfields: [
        { shortname: 'studentid', value: 'STU001234' },
        { shortname: 'year', value: '2024' }
      ]
    };
  }

  /**
   * Extract student ID from Moodle user
   */
  static extractStudentId(user: MoodleUserInfo): string {
    // Try custom fields first
    const studentIdField = user.customfields?.find(
      field => field.shortname.toLowerCase().includes('studentid') || 
               field.shortname.toLowerCase().includes('student_id')
    );
    
    if (studentIdField?.value) {
      return studentIdField.value;
    }

    // Fallback to username
    return user.username;
  }

  /**
   * Format user display name
   */
  static formatUserDisplayName(user: MoodleUserInfo): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(session: IdentificationSession): boolean {
    if (!session.isValid) return false;
    
    // Check if session is not expired (24 hours)
    const sessionAge = new Date().getTime() - new Date(session.timestamp).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge < maxAge;
  }

  /**
   * Sanitize Moodle URL
   */
  static sanitizeUrl(url: string): string {
    return url.trim().replace(/\/+$/, ''); // Remove trailing slashes
  }

  /**
   * Generate session storage key
   */
  static getSessionStorageKey(userId: number): string {
    return `moodle_session_${userId}`;
  }

  /**
   * Parse custom fields into key-value object
   */
  static parseCustomFields(customFields?: Array<{ shortname: string; value: string }>): Record<string, string> {
    if (!customFields) return {};
    
    return customFields.reduce((acc, field) => {
      acc[field.shortname] = field.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get Moodle context information
   */
  static getMoodleContext(): any {
    return (window as any).M?.cfg || null;
  }

  /**
   * Log Moodle activity for debugging
   */
  static logActivity(action: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Moodle] ${action}`, data);
    }
  }
}