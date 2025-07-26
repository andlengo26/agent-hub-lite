/**
 * Enhanced API client with fallback mechanisms and robust error handling
 * Provides a consistent interface for all API calls with MSW integration
 */

import config from './config';
import { getFallbackData, verifyMSW, getMSWStatus } from './mock-server';
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
  private retryCount: number = 0;
  private maxRetries: number = 2;

  constructor() {
    this.baseUrl = config.mock.enabled ? '/api/mock' : config.api.baseUrl;
  }

  // Check if response looks like HTML instead of JSON
  private isHtmlResponse(text: string): boolean {
    return text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
  }

  // Enhanced fallback mechanism
  private getFallbackResponse(endpoint: string): any {
    console.log('🔄 API client using fallback for:', endpoint);
    const mswStatus = getMSWStatus();
    console.log('🔧 MSW Status:', mswStatus);
    
    return getFallbackData(endpoint);
  }

  // Determine if we should use fallback based on response
  private shouldUseFallback(response: Response, responseText: string): boolean {
    // Use fallback if:
    // 1. Response claims to be JSON but is actually HTML
    // 2. MSW is not working properly
    // 3. Response status indicates server error
    
    const contentType = response.headers.get('content-type') || '';
    const isSupposedlyJson = contentType.includes('application/json');
    const isActuallyHtml = this.isHtmlResponse(responseText);
    const isMSWWorking = verifyMSW();
    
    const shouldFallback = (isSupposedlyJson && isActuallyHtml) || 
                          !isMSWWorking || 
                          response.status >= 500;
    
    if (shouldFallback) {
      console.warn('⚠️ Using fallback mechanism due to:', {
        isSupposedlyJson,
        isActuallyHtml,
        isMSWWorking,
        status: response.status,
        contentType
      });
    }
    
    return shouldFallback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
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
      
      // Get response text first to check if it's HTML
      const responseText = await response.text();
      
      // Check if we should use fallback
      if (config.mock.enabled && this.shouldUseFallback(response, responseText)) {
        console.log('🔄 Switching to fallback mechanism');
        return this.getFallbackResponse(endpoint);
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          // Try to parse as JSON if it's not HTML
          if (!this.isHtmlResponse(responseText)) {
            const error: ApiError = JSON.parse(responseText);
            errorMessage = error.message || errorMessage;
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        // If we're in mock mode and get an error, try fallback
        if (config.mock.enabled && this.retryCount < this.maxRetries) {
          console.log(`🔄 Retrying with fallback (attempt ${this.retryCount + 1})`);
          this.retryCount++;
          return this.getFallbackResponse(endpoint);
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response
      let data: any;
      try {
        if (this.isHtmlResponse(responseText)) {
          // If response is HTML but we expected JSON, use fallback
          if (config.mock.enabled) {
            console.warn('⚠️ Received HTML instead of JSON, using fallback');
            return this.getFallbackResponse(endpoint);
          }
          throw new Error('Received HTML response when expecting JSON');
        }
        
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('📄 Response text:', responseText.substring(0, 200) + '...');
        
        // Use fallback in mock mode
        if (config.mock.enabled) {
          console.log('🔄 JSON parse failed, using fallback');
          return this.getFallbackResponse(endpoint);
        }
        
        throw new Error('Invalid JSON response from server');
      }
      
      console.log(`🌐 API Success:`, data);
      this.retryCount = 0; // Reset retry count on success
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      
      // Use fallback in mock mode for network errors
      if (config.mock.enabled && this.retryCount < this.maxRetries) {
        console.log(`🔄 Network error, trying fallback (attempt ${this.retryCount + 1})`);
        this.retryCount++;
        return this.getFallbackResponse(endpoint);
      }
      
      this.retryCount = 0; // Reset retry count
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