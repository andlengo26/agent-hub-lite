/**
 * API client with static mock integration
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
    // Use static mocks in development, real API in production
    this.baseUrl = config.mock.enabled ? '/mocks' : '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    const maxRetries = 2;
    
    // For static mocks, append .json to the endpoint
    if (config.mock.enabled) {
      url = `${this.baseUrl}${endpoint}.json`;
    }
    
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
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails: any = null;
        
        try {
          const errorResponse: ApiError = await response.json();
          errorMessage = errorResponse.message || errorMessage;
          errorDetails = errorResponse.details;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
          errorDetails = { status: response.status };
        }
        
        const apiError = new Error(errorMessage);
        apiError.name = 'ApiError';
        (apiError as any).status = response.status;
        (apiError as any).details = errorDetails;
        
        throw apiError;
      }

      const data: T = await response.json();
      console.log(`🌐 API Success:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, {
        error: error.message,
        name: error.name,
        attempt: retryCount + 1,
        maxRetries: maxRetries + 1
      });
      
      // Retry logic for network errors or server errors (500+)
      const shouldRetry = (
        retryCount < maxRetries &&
        (
          error.name === 'TypeError' || // Network errors
          (error.name === 'ApiError' && (error as any).status >= 500)
        )
      );
      
      if (shouldRetry) {
        console.log(`🔄 Retrying API request in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return this.request<T>(endpoint, options, retryCount + 1);
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
    if (config.mock.enabled) {
      return this.request(`/chats`);
    }
    
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
    if (config.mock.enabled) {
      return this.request(`/users`);
    }
    
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

  // Documents
  async getDocuments(params?: { page?: number; limit?: number; }): Promise<ApiResponse<any[]>> {
    if (config.mock.enabled) {
      return this.request(`/documents`);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/documents${query ? `?${query}` : ''}`);
  }

  // FAQs
  async getFAQs(params?: { page?: number; limit?: number; }): Promise<ApiResponse<any[]>> {
    if (config.mock.enabled) {
      return this.request(`/faqs`);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/faqs${query ? `?${query}` : ''}`);
  }

  // Scraper Jobs
  async getScraperJobs(params?: { page?: number; limit?: number; }): Promise<ApiResponse<any[]>> {
    if (config.mock.enabled) {
      return this.request(`/scraper-jobs`);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/scraper-jobs${query ? `?${query}` : ''}`);
  }

  // Domains
  async getDomains(params?: { page?: number; limit?: number; }): Promise<ApiResponse<any[]>> {
    if (config.mock.enabled) {
      return this.request(`/domains`);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/domains${query ? `?${query}` : ''}`);
  }

  // Resources
  async getResources(params?: { page?: number; limit?: number; }): Promise<ApiResponse<any[]>> {
    if (config.mock.enabled) {
      return this.request(`/resources`);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/resources${query ? `?${query}` : ''}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();