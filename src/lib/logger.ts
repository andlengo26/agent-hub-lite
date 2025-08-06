/**
 * Application logger with environment-aware configuration
 * Provides structured logging for debugging and monitoring
 */

import config from './config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  component?: string;
}

class Logger {
  private isDevelopment = config.app.environment === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      ...(component && { component }),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return true;
  }

  private log(level: LogLevel, message: string, data?: any, component?: string) {
    if (!this.shouldLog(level)) return;

    const entry = this.formatMessage(level, message, data, component);
    
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}${component ? ` (${component})` : ''}:`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }

  debug(message: string, data?: any, component?: string) {
    this.log('debug', message, data, component);
  }

  info(message: string, data?: any, component?: string) {
    this.log('info', message, data, component);
  }

  warn(message: string, data?: any, component?: string) {
    this.log('warn', message, data, component);
  }

  error(message: string, data?: any, component?: string) {
    this.log('error', message, data, component);
  }

  // API-specific logging
  apiRequest(method: string, url: string, data?: any) {
    this.debug(`API ${method.toUpperCase()} ${url}`, data, 'API');
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    if (status >= 400) {
      this.error(`API ${method.toUpperCase()} ${url} failed (${status})`, data, 'API');
    } else {
      this.debug(`API ${method.toUpperCase()} ${url} success (${status})`, data, 'API');
    }
  }

  // Component lifecycle logging
  componentMount(componentName: string, props?: any) {
    this.debug(`Component mounted`, props, componentName);
  }

  componentUnmount(componentName: string) {
    this.debug(`Component unmounted`, undefined, componentName);
  }

  // Feature flag logging
  featureFlag(flagName: string, enabled: boolean, context?: any) {
    this.info(`Feature flag: ${flagName} = ${enabled}`, context, 'FeatureFlags');
  }

  // Message persistence logging
  messagePersistence(operation: string, data?: any, component?: string) {
    this.debug(`MESSAGE PERSISTENCE: ${operation}`, data, component || 'MessagePersistence');
  }

  // State transition logging
  stateTransition(from: string, to: string, reason?: string, data?: any, component?: string) {
    this.info(`STATE TRANSITION: ${from} → ${to}${reason ? ` (${reason})` : ''}`, data, component || 'StateTransition');
  }

  // Race condition detection logging
  raceCondition(operation: string, details: any, component?: string) {
    this.warn(`RACE CONDITION DETECTED: ${operation}`, details, component || 'RaceCondition');
  }

  // Message count validation
  messageValidation(expected: number, actual: number, operation: string, data?: any) {
    if (expected !== actual) {
      this.error(`MESSAGE COUNT MISMATCH: Expected ${expected}, got ${actual} during ${operation}`, data, 'MessageValidation');
    } else {
      this.debug(`Message count validation passed: ${actual} messages during ${operation}`, data, 'MessageValidation');
    }
  }
}

export const logger = new Logger();