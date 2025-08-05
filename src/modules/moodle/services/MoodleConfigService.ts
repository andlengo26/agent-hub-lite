/**
 * Moodle Configuration Service
 * Handles Moodle configuration validation and management
 */

import { MoodleConfig, MoodleValidationError } from '../types';

export class MoodleConfigService {
  /**
   * Default Moodle configuration
   */
  static getDefaultConfig(): MoodleConfig {
    return {
      moodleUrl: '',
      apiToken: '',
      enabled: false,
      autoLogin: true,
      requiredFields: {
        studentId: true,
        department: false
      }
    };
  }

  /**
   * Validate Moodle configuration
   */
  static validateConfig(config: Partial<MoodleConfig>): MoodleValidationError[] {
    const errors: MoodleValidationError[] = [];

    // URL validation
    if (!config.moodleUrl) {
      errors.push({
        field: 'moodleUrl',
        message: 'Moodle URL is required'
      });
    } else if (!/^https?:\/\/.+/.test(config.moodleUrl)) {
      errors.push({
        field: 'moodleUrl',
        message: 'Moodle URL must be a valid URL starting with http:// or https://'
      });
    } else if (config.moodleUrl.endsWith('/')) {
      errors.push({
        field: 'moodleUrl',
        message: 'Moodle URL should not end with a trailing slash'
      });
    }

    // API Token validation
    if (!config.apiToken) {
      errors.push({
        field: 'apiToken',
        message: 'Moodle API token is required'
      });
    } else if (config.apiToken.length < 32) {
      errors.push({
        field: 'apiToken',
        message: 'Moodle API token appears to be invalid (too short)'
      });
    } else if (!/^[a-f0-9]+$/i.test(config.apiToken)) {
      errors.push({
        field: 'apiToken',
        message: 'Moodle API token should only contain hexadecimal characters'
      });
    }

    return errors;
  }

  /**
   * Sanitize Moodle configuration
   */
  static sanitizeConfig(config: Partial<MoodleConfig>): MoodleConfig {
    const defaultConfig = this.getDefaultConfig();
    
    return {
      moodleUrl: (config.moodleUrl || '').trim().replace(/\/$/, ''),
      apiToken: (config.apiToken || '').trim(),
      enabled: Boolean(config.enabled),
      autoLogin: config.autoLogin !== undefined ? Boolean(config.autoLogin) : defaultConfig.autoLogin,
      requiredFields: {
        studentId: config.requiredFields?.studentId !== undefined 
          ? Boolean(config.requiredFields.studentId) 
          : defaultConfig.requiredFields.studentId,
        department: config.requiredFields?.department !== undefined 
          ? Boolean(config.requiredFields.department) 
          : defaultConfig.requiredFields.department
      }
    };
  }

  /**
   * Test Moodle configuration
   */
  static async testConfig(config: MoodleConfig): Promise<{ success: boolean; message: string }> {
    try {
      // First validate the configuration
      const errors = this.validateConfig(config);
      if (errors.length > 0) {
        return {
          success: false,
          message: `Configuration errors: ${errors.map(e => e.message).join(', ')}`
        };
      }

      // Test basic connectivity
      const testUrl = `${config.moodleUrl}/webservice/rest/server.php`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          wstoken: config.apiToken,
          wsfunction: 'core_webservice_get_site_info',
          moodlewsrestformat: 'json'
        })
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to connect to Moodle (HTTP ${response.status})`
        };
      }

      const data = await response.json();
      
      if (data.exception) {
        return {
          success: false,
          message: `Moodle error: ${data.message || 'Unknown error'}`
        };
      }

      return {
        success: true,
        message: 'Connection successful! Moodle integration is properly configured.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get required web service functions
   */
  static getRequiredWebServiceFunctions(): string[] {
    return [
      'core_webservice_get_site_info',
      'core_user_get_users_by_field'
    ];
  }

  /**
   * Generate setup instructions
   */
  static getSetupInstructions(): Array<{ step: number; title: string; description: string }> {
    return [
      {
        step: 1,
        title: 'Enable Web Services in Moodle',
        description: 'Go to Site administration → Advanced features → Enable web services'
      },
      {
        step: 2,
        title: 'Create External Service',
        description: 'Add required functions: core_webservice_get_site_info, core_user_get_users_by_field'
      },
      {
        step: 3,
        title: 'Generate Token',
        description: 'Create a web service token for the service and copy it above'
      },
      {
        step: 4,
        title: 'Test Configuration',
        description: 'Use the test button above to verify the connection works'
      }
    ];
  }
}