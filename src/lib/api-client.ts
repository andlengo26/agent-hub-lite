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
    console.log('ApiClient initialized:', { 
      mockEnabled: config.mock.enabled, 
      baseUrl: this.baseUrl,
      environment: import.meta.env.MODE 
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request:', { url, options: defaultOptions });
      const response = await fetch(url, defaultOptions);
      
      console.log('API response received:', { 
        url, 
        status: response.status, 
        contentType: response.headers.get('content-type'),
        ok: response.ok 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', { url, status: response.status, body: errorText });
        
        let error: ApiError;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: `HTTP ${response.status}: ${errorText || 'Unknown error'}` };
        }
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', { url, body: responseText });
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', { url, body: responseText, error: parseError });
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
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