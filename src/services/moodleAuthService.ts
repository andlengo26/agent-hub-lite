/**
 * Moodle Authentication Service
 * Handles authentication with Moodle LMS systems
 */

import { UserIdentificationData, IdentificationSession } from '@/types/user-identification';
import { MoodleConfig, MoodleUserInfo, MoodleAuthResponse, MoodleValidationError } from '@/types/moodle';

export class MoodleAuthService {
  /**
   * Authenticate user with Moodle using session token
   */
  static async authenticateWithMoodle(
    config: MoodleConfig,
    sessionToken?: string
  ): Promise<MoodleAuthResponse> {
    if (!config.enabled || !config.moodleUrl || !config.apiToken) {
      return {
        success: false,
        error: 'Moodle integration not properly configured'
      };
    }

    try {
      // If no session token provided, attempt to get from Moodle context
      const token = sessionToken || await this.getMoodleSessionToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No valid Moodle session found'
        };
      }

      // Call Moodle Web Service to get user info
      const userInfo = await this.fetchMoodleUserInfo(config, token);
      
      if (!userInfo) {
        return {
          success: false,
          error: 'Failed to fetch user information from Moodle'
        };
      }

      return {
        success: true,
        user: userInfo,
        token
      };
    } catch (error) {
      console.error('Moodle authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Create identification session from Moodle user info
   */
  static createIdentificationSession(
    moodleUser: MoodleUserInfo,
    token: string
  ): IdentificationSession {
    const userData: UserIdentificationData = {
      name: `${moodleUser.firstname} ${moodleUser.lastname}`.trim(),
      email: moodleUser.email,
      studentId: moodleUser.username,
      department: moodleUser.department,
      customFields: moodleUser.customfields?.reduce((acc, field) => {
        acc[field.shortname] = field.value;
        return acc;
      }, {} as Record<string, string>)
    };

    return {
      id: `moodle_${moodleUser.id}_${Date.now()}`,
      type: 'moodle_authentication',
      userData,
      timestamp: new Date(),
      isValid: true,
      sessionToken: token
    };
  }

  /**
   * Get Moodle session token from current page context
   */
  private static async getMoodleSessionToken(): Promise<string | null> {
    try {
      // Check if we're in a Moodle context
      const moodleConfig = (window as any).M?.cfg;
      if (moodleConfig?.sesskey) {
        return moodleConfig.sesskey;
      }

      // Try to get from cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'MoodleSession') {
          return value;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get Moodle session token:', error);
      return null;
    }
  }

  /**
   * Fetch user information from Moodle Web Service
   */
  private static async fetchMoodleUserInfo(
    config: MoodleConfig,
    token: string
  ): Promise<MoodleUserInfo | null> {
    try {
      const response = await fetch(
        `${config.moodleUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            wstoken: config.apiToken,
            wsfunction: 'core_webservice_get_site_info',
            moodlewsrestformat: 'json',
            sesskey: token
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.exception) {
        throw new Error(data.message || 'Moodle API error');
      }

      // Get detailed user info
      const userResponse = await fetch(
        `${config.moodleUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            wstoken: config.apiToken,
            wsfunction: 'core_user_get_users_by_field',
            moodlewsrestformat: 'json',
            field: 'id',
            'values[0]': data.userid?.toString() || '0'
          })
        }
      );

      const userData = await userResponse.json();
      
      if (userData.length > 0) {
        return userData[0];
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch Moodle user info:', error);
      return null;
    }
  }

  /**
   * Check if current context supports Moodle authentication
   */
  static isMoodleContext(): boolean {
    try {
      // Check for Moodle global objects
      const hasMoodleGlobals = !!(window as any).M?.cfg;
      
      // Check for Moodle-specific elements
      const hasMoodleElements = document.querySelector('[data-region="moodle"]') ||
                               document.querySelector('#page-wrapper') ||
                               document.querySelector('.moodle-body');

      return hasMoodleGlobals || !!hasMoodleElements;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate Moodle configuration
   */
  static validateConfig(config: Partial<MoodleConfig>): string[] {
    const errors: string[] = [];

    if (!config.moodleUrl) {
      errors.push('Moodle URL is required');
    } else if (!/^https?:\/\/.+/.test(config.moodleUrl)) {
      errors.push('Moodle URL must be a valid URL');
    }

    if (!config.apiToken) {
      errors.push('Moodle API token is required');
    } else if (config.apiToken.length < 32) {
      errors.push('Moodle API token appears to be invalid');
    }

    return errors;
  }
}