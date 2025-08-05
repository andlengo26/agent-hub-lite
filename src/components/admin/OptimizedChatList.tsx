/**
 * Optimized Chat List Component
 * Uses virtual scrolling for large chat datasets
 */

import React, { useMemo, useState, useCallback } from 'react';
import { VirtualTable } from '@/components/ui/virtual-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePerformanceMonitor, useDebounced } from '@/utils/performance';
import { Chat } from '@/types';
import { MoreHorizontal, UserPlus, MessageSquareX, XCircle } from 'lucide-react';

interface OptimizedChatListProps {
  chats: Chat[];
  users: any[];
  onChatSelect?: (chat: Chat) => void;
  onAssignAgent?: (chat: Chat) => void;
  onCloseChat?: (chat: Chat) => void;
  loading?: boolean;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'missed': return 'destructive';
    case 'closed': return 'secondary';
    default: return 'outline';
  }
};

export function OptimizedChatList({
  chats,
  users,
  onChatSelect,
  onAssignAgent,
  onCloseChat,
  loading = false
}: OptimizedChatListProps) {
  // Performance monitoring
  usePerformanceMonitor('OptimizedChatList');

  // Memoized columns definition
  const columns = useMemo(() => [
    {
      key: 'customerName' as keyof Chat,
      label: 'Customer',
      width: 200,
      sortable: true,
      render: (value: any, chat: Chat) => (
        <div className="flex flex-col">
          <span className="font-medium truncate">{value}</span>
          <span className="text-sm text-muted-foreground truncate">{chat.requesterEmail}</span>
        </div>
      ),
    },
    {
      key: 'status' as keyof Chat,
      label: 'Status',
      width: 120,
      sortable: true,
      render: (value: any) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'assignedTo' as keyof Chat,
      label: 'Agent',
      width: 150,
      sortable: true,
      render: (value: any) => {
        if (!value) return <span className="text-muted-foreground">Unassigned</span>;
        const agent = users.find(user => user.id === value);
        return agent ? `${agent.name}` : 'Unknown Agent';
      },
    },
    {
      key: 'startTime' as keyof Chat,
      label: 'Started',
      width: 120,
      sortable: true,
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'waitTime' as keyof Chat,
      label: 'Wait Time',
      width: 100,
      sortable: true,
      render: (value: any) => value ? `${Math.round(value / 60)}m` : '—',
    },
    {
      key: 'id' as keyof Chat,
      label: 'Actions',
      width: 100,
      render: (value: any, chat: Chat) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChatSelect?.(chat)}>
              <MessageSquareX className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignAgent?.(chat)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Agent
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onCloseChat?.(chat)}
              className="text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Close Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }
  ], [users, onChatSelect, onAssignAgent, onCloseChat]);

  // Handle selection changes
  const handleSelectionChange = useCallback((selectedChats: Chat[]) => {
    console.log('Selected chats:', selectedChats.length);
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <VirtualTable
      data={chats}
      columns={columns}
      itemHeight={64}
      containerHeight={600}
      selectable={true}
      searchable={true}
      onSelectionChange={handleSelectionChange}
      onItemClick={onChatSelect}
      emptyMessage="No chats found"
      className="w-full"
    />
  );
}

// Memoized version for better performance
export const MemoizedOptimizedChatList = React.memo(OptimizedChatList);