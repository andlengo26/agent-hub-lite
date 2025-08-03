/**
 * React Query hooks for the enhanced EngagementService
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EngagementService } from '@/services/engagementService';
import { toast } from '@/hooks/use-toast';
import { CustomerEngagement, Chat } from '@/types';

interface CreateEngagementFromChatParams {
  chat: Chat;
  agentId: string;
  agentName: string;
  aiSummary?: string;
  notes?: string[];
}

interface CreateEngagementFromEmailParams {
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  agentId: string;
  agentName: string;
  subject: string;
  content: string;
  aiSummary?: string;
  notes?: string[];
}

interface CreateEngagementFromPhoneParams {
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  agentId: string;
  agentName: string;
  duration: number;
  summary: string;
  aiSummary?: string;
  notes?: string[];
}

interface AddNoteParams {
  engagementId: string;
  note: string;
  authorId: string;
  authorName: string;
}

// Hook for creating engagement from chat
export function useCreateEngagementFromChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEngagementFromChatParams) => 
      EngagementService.createEngagementFromChat(params),
    onSuccess: (engagement: CustomerEngagement) => {
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
      toast({
        title: "Engagement Created",
        description: `Chat engagement created for ${engagement.customerName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create engagement from chat",
        variant: "destructive",
      });
    },
  });
}

// Hook for creating engagement from email
export function useCreateEngagementFromEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEngagementFromEmailParams) => 
      EngagementService.createEngagementFromEmail(params),
    onSuccess: (engagement: CustomerEngagement) => {
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
      toast({
        title: "Engagement Created",
        description: `Email engagement created for ${engagement.customerName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create engagement from email",
        variant: "destructive",
      });
    },
  });
}

// Hook for creating engagement from phone
export function useCreateEngagementFromPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEngagementFromPhoneParams) => 
      EngagementService.createEngagementFromPhone(params),
    onSuccess: (engagement: CustomerEngagement) => {
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['engagements'] });
      toast({
        title: "Engagement Created",
        description: `Phone engagement created for ${engagement.customerName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create engagement from phone",
        variant: "destructive",
      });
    },
  });
}

// Hook for adding notes to engagement
export function useAddNoteToEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddNoteParams) => 
      EngagementService.addNoteToEngagement(params.engagementId, params.note, params.authorId, params.authorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-engagements'] });
      toast({
        title: "Note Added",
        description: "Note has been added to the engagement",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add note to engagement",
        variant: "destructive",
      });
    },
  });
}