/**
 * Custom hook for API queries with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// Chat queries
export function useChats(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'resolved' | 'pending';
}) {
  return useQuery({
    queryKey: ['chats', params],
    queryFn: () => apiClient.getChats(params),
    staleTime: 30000, // 30 seconds
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
    mutationFn: apiClient.createChat.bind(apiClient),
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

// User queries  
export function useUsers(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiClient.getUsers(params),
    staleTime: 60000 // 1 minute
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

// Organization queries
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiClient.getOrganizations(),
    staleTime: 300000 // 5 minutes
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