/**
 * Debug utilities for development
 */

import { apiClient } from './api-client';
import config from './config';

export const debugAPI = {
  // Test if MSW is working
  async testMSW() {
    console.log('=== MSW Debug Test ===');
    console.log('Config:', { 
      mockEnabled: config.mock.enabled,
      apiDelay: config.mock.apiDelay,
      environment: import.meta.env.MODE
    });

    try {
      console.log('Testing health endpoint...');
      const health = await apiClient.healthCheck();
      console.log('✅ Health check successful:', health);

      console.log('Testing chats endpoint...');
      const chats = await apiClient.getChats({ limit: 2 });
      console.log('✅ Chats fetch successful:', chats);

      console.log('Testing users endpoint...');
      const users = await apiClient.getUsers({ limit: 2 });
      console.log('✅ Users fetch successful:', users);

      return { success: true };
    } catch (error) {
      console.error('❌ MSW test failed:', error);
      return { success: false, error };
    }
  },

  // Check service worker status
  checkServiceWorker() {
    console.log('=== Service Worker Status ===');
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Active registrations:', registrations.length);
        registrations.forEach((registration, index) => {
          console.log(`Registration ${index}:`, {
            scope: registration.scope,
            active: !!registration.active,
            installing: !!registration.installing,
            waiting: !!registration.waiting
          });
        });
      });
    } else {
      console.log('Service Worker not supported');
    }
  },

  // Test raw fetch to mock endpoints
  async testRawFetch() {
    console.log('=== Raw Fetch Test ===');
    
    const endpoints = [
      '/api/mock/health',
      '/api/mock/chats',
      '/api/mock/users'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint}...`);
        const response = await fetch(endpoint);
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        console.log(`${endpoint} response:`, {
          status: response.status,
          contentType,
          bodyPreview: text.substring(0, 100) + '...'
        });

        if (contentType?.includes('application/json')) {
          try {
            const json = JSON.parse(text);
            console.log(`${endpoint} JSON:`, json);
          } catch (e) {
            console.error(`${endpoint} JSON parse error:`, e);
          }
        }
      } catch (error) {
        console.error(`${endpoint} fetch error:`, error);
      }
    }
  }
};

// Make available globally in development
if (config.app.environment === 'development') {
  (window as any).debugAPI = debugAPI;
  console.log('🐛 Debug utilities available as window.debugAPI');
  console.log('Available methods: testMSW(), checkServiceWorker(), testRawFetch()');
}