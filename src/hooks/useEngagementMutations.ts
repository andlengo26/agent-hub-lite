/**
 * Mutation hooks for engagement operations with real-time sync
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerEngagement } from '@/types';
import { toast } from '@/hooks/use-toast';
// Removed sync dependency

interface CreateEngagementParams {
  customerId: string;
  engagement: Omit<CustomerEngagement, 'id'>;
}

interface UpdateEngagementParams {
  customerId: string;
  engagementId: string;
  engagement: Partial<CustomerEngagement>;
}

interface DeleteEngagementParams {
  customerId: string;
  engagementId: string;
}

export function useCreateEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, engagement }: CreateEngagementParams) => {
      // Simulate API call - in real implementation, this would be a POST request
      const newEngagement: CustomerEngagement = {
        ...engagement,
        id: `eng_${Date.now()}`,
      };

      // Optimistic update
      queryClient.setQueryData(
        ['customer-engagements', customerId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            engagements: [newEngagement, ...oldData.engagements],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1,
            },
          };
        }
      );

      return newEngagement;
    },
    onSuccess: (newEngagement, { customerId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['customer-engagements', customerId] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      toast({
        title: "Engagement Created",
        description: "New engagement record has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create engagement record.",
        variant: "destructive",
      });
      console.error('Failed to create engagement:', error);
    },
  });
}

export function useUpdateEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, engagementId, engagement }: UpdateEngagementParams) => {
      // Simulate API call - in real implementation, this would be a PUT/PATCH request
      const updatedEngagement = { ...engagement, id: engagementId };

      // Optimistic update
      queryClient.setQueryData(
        ['customer-engagements', customerId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            engagements: oldData.engagements.map((eng: CustomerEngagement) =>
              eng.id === engagementId ? { ...eng, ...engagement } : eng
            ),
          };
        }
      );

      return updatedEngagement;
    },
    onSuccess: (updatedEngagement, { customerId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['customer-engagements', customerId] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });

      toast({
        title: "Engagement Updated",
        description: "Engagement record has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update engagement record.",
        variant: "destructive",
      });
      console.error('Failed to update engagement:', error);
    },
  });
}

export function useDeleteEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, engagementId }: DeleteEngagementParams) => {
      // Simulate API call - in real implementation, this would be a DELETE request
      
      // Optimistic update
      queryClient.setQueryData(
        ['customer-engagements', customerId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            engagements: oldData.engagements.filter((eng: CustomerEngagement) => eng.id !== engagementId),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1),
            },
          };
        }
      );

      return { customerId, engagementId };
    },
    onSuccess: (_, { customerId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['customer-engagements', customerId] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      toast({
        title: "Engagement Deleted",
        description: "Engagement record has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete engagement record.",
        variant: "destructive",
      });
      console.error('Failed to delete engagement:', error);
    },
  });
}