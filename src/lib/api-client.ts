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
    this.baseUrl = config.mock.enabled ? '/api/mock' : config.api.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    
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
      
      // Check if response is HTML (indicating MSW is not working)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`API returned HTML instead of JSON. This usually means MSW is not intercepting requests properly. URL: ${url}`);
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error: ApiError = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`🌐 API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
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