/**
 * Custom hook for API queries with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { CreateOrganizationInput, InviteUserInput } from '@/lib/validations';

// Enhanced chat queries with API client only
export function useChats(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'resolved' | 'pending';
}) {
  return useQuery({
    queryKey: ['chats', params],
    queryFn: async () => {
      console.log('🔄 useChats: Fetching chats with params:', params);
      const result = await apiClient.getChats(params);
      console.log('✅ useChats: Successfully fetched chats via API client:', result);
      return result;
    },
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Retry network errors, but not API errors
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

export function useChat(chatId: string) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiClient.getChatById(chatId),
    enabled: !!chatId
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { customerId: string; subject: string; priority?: 'low' | 'medium' | 'high' | 'urgent' }) =>
      apiClient.createChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast({
        title: "Success",
        description: "Chat created successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to create chat', { error });
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  });
}

// Enhanced user queries with API client only
export function useUsers(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      console.log('🔄 useUsers: Fetching users with params:', params);
      const result = await apiClient.getUsers(params);
      console.log('✅ useUsers: Successfully fetched users via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      // Retry network errors, but not API errors
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<any> }) =>
      apiClient.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success", 
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to update user', { error });
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to delete user', { error });
      toast({
        title: "Error", 
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  });
}

// Enhanced organization queries with API client only
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      console.log('🔄 useOrganizations: Fetching organizations');
      const result = await apiClient.getOrganizations();
      console.log('✅ useOrganizations: Successfully fetched organizations via API client:', result);
      return result;
    },
    staleTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      // Retry network errors, but not API errors
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOrganizationInput) => 
      apiClient.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to create organization', { error });
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: any }) =>
      apiClient.updateOrganization(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to update organization', { error });
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orgId: string) => apiClient.deleteOrganization(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to delete organization', { error });
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InviteUserInput) =>
      apiClient.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User invitation sent successfully",
      });
    },
    onError: (error) => {
      logger.error('Failed to send invitation', { error });
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  });
}

// Documents hooks
export function useDocuments(params?: { page?: number; limit?: number; }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      console.log('🔄 useDocuments: Fetching documents with params:', params);
      const result = await apiClient.getDocuments(params);
      console.log('✅ useDocuments: Successfully fetched documents via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

// FAQs hooks
export function useFAQs(params?: { page?: number; limit?: number; }) {
  return useQuery({
    queryKey: ['faqs', params],
    queryFn: async () => {
      console.log('🔄 useFAQs: Fetching FAQs with params:', params);
      const result = await apiClient.getFAQs(params);
      console.log('✅ useFAQs: Successfully fetched FAQs via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

// Scraper Jobs hooks
export function useScraperJobs(params?: { page?: number; limit?: number; }) {
  return useQuery({
    queryKey: ['scraper-jobs', params],
    queryFn: async () => {
      console.log('🔄 useScraperJobs: Fetching scraper jobs with params:', params);
      const result = await apiClient.getScraperJobs(params);
      console.log('✅ useScraperJobs: Successfully fetched scraper jobs via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

// Domains hooks
export function useDomains(params?: { page?: number; limit?: number; }) {
  return useQuery({
    queryKey: ['domains', params],
    queryFn: async () => {
      console.log('🔄 useDomains: Fetching domains with params:', params);
      const result = await apiClient.getDomains(params);
      console.log('✅ useDomains: Successfully fetched domains via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

// Resources hooks
export function useResources(params?: { page?: number; limit?: number; }) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: async () => {
      console.log('🔄 useResources: Fetching resources with params:', params);
      const result = await apiClient.getResources(params);
      console.log('✅ useResources: Successfully fetched resources via API client:', result);
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount < 2 && error.message.includes('fetch');
    }
  });
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 60000, // 1 minute
    retry: 3
  });
}