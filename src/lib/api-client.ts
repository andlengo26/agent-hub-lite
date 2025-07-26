/**
 * API client with mock integration
 * Provides a consistent interface for all API calls
 */

import config from './config';
import type { CreateOrganizationInput, InviteUserInput } from './validations';

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Always use relative URLs for same-origin requests
    this.baseUrl = config.mock.enabled ? '/api/mock' : '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = 2;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint} (attempt ${retryCount + 1})`);
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      console.log(`🌐 API Response: ${response.status} ${response.statusText}`);
      console.log(`🌐 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Enhanced MSW failure detection
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.clone().text();
      
      // Check for HTML responses (MSW not working)
      if (contentType.includes('text/html') || responseText.includes('<!DOCTYPE html>')) {
        const mswError = new Error(
          `API returned HTML instead of JSON for ${endpoint}. ` +
          `This indicates MSW is not intercepting requests. ` +
          `Response preview: ${responseText.substring(0, 200)}...`
        );
        mswError.name = 'MSWNotWorkingError';
        
        console.error('❌ MSW Failure Detected:', {
          url,
          contentType,
          responsePreview: responseText.substring(0, 500),
          responseStatus: response.status
        });
        
        throw mswError;
      }
      
      // Check for 404 on health check (common MSW issue)
      if (endpoint === '/health' && response.status === 404) {
        const error = new Error(
          'Health check endpoint not found. MSW may not be properly configured or started.'
        );
        error.name = 'MSWHealthCheckError';
        throw error;
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails: any = null;
        
        try {
          const errorResponse: ApiError = await response.json();
          errorMessage = errorResponse.message || errorMessage;
          errorDetails = errorResponse.details;
        } catch (parseError) {
          // If response is not JSON, use status text and response preview
          errorMessage = response.statusText || errorMessage;
          errorDetails = { responsePreview: responseText.substring(0, 200) };
        }
        
        const apiError = new Error(errorMessage);
        apiError.name = 'ApiError';
        (apiError as any).status = response.status;
        (apiError as any).details = errorDetails;
        
        throw apiError;
      }

      // Parse JSON response
      let data: T;
      try {
        data = await response.json();
        console.log(`🌐 API Success:`, data);
        return data;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.error('❌ Response text:', responseText);
        throw new Error(
          `Failed to parse API response as JSON for ${endpoint}. ` +
          `Response: ${responseText.substring(0, 200)}...`
        );
      }
      
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, {
        error: error.message,
        name: error.name,
        attempt: retryCount + 1,
        maxRetries: maxRetries + 1
      });
      
      // Retry logic for certain types of errors
      const shouldRetry = (
        retryCount < maxRetries &&
        (
          error.name === 'TypeError' || // Network errors
          error.name === 'MSWNotWorkingError' ||
          (error.name === 'ApiError' && (error as any).status >= 500)
        )
      );
      
      if (shouldRetry) {
        console.log(`🔄 Retrying API request in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      // Add helpful context to MSW errors
      if (error.name === 'MSWNotWorkingError' || error.name === 'MSWHealthCheckError') {
        console.error('🔧 MSW Troubleshooting Tips:');
        console.error('   1. Check that mockServiceWorker.js is in the public directory');
        console.error('   2. Verify MSW started successfully in browser console');
        console.error('   3. Try refreshing the page to restart MSW');
        console.error('   4. Check network tab for intercepted requests');
      }
      
      throw error;
    }
  }

  // Chat endpoints
  async getChats(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'resolved' | 'pending';
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request(`/chats${query ? `?${query}` : ''}`);
  }

  async getChatById(chatId: string): Promise<ApiResponse<any>> {
    return this.request(`/chats/${chatId}`);
  }

  async createChat(data: {
    customerId: string;
    subject: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<ApiResponse<any>> {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async updateUser(userId: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Organization endpoints
  async getOrganizations(): Promise<ApiResponse<any[]>> {
    return this.request('/organizations');
  }

  async createOrganization(data: CreateOrganizationInput): Promise<ApiResponse<any>> {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(orgId: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(`/organizations/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(orgId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/organizations/${orgId}`, {
      method: 'DELETE',
    });
  }

  // User invite endpoint
  async inviteUser(data: InviteUserInput): Promise<ApiResponse<any>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();