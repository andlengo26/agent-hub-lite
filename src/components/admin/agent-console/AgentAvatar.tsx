/**
 * Agent Avatar component - displays human or AI agent representation
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot } from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface AgentAvatarProps {
  assignedAgentId?: string;
  handledBy?: 'human' | 'ai';
  users: User[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AgentAvatar({ 
  assignedAgentId, 
  handledBy, 
  users, 
  size = 'sm',
  className 
}: AgentAvatarProps) {
  // Find the assigned human agent
  const assignedAgent = assignedAgentId ? users.find(user => user.id === assignedAgentId) : null;
  
  // Determine if this is AI or human handled
  const isAIHandled = handledBy === 'ai' || (!assignedAgentId && !assignedAgent);
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (isAIHandled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center",
              sizeClasses[size],
              className
            )}>
              <Bot className={cn("text-primary", iconSizes[size])} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (assignedAgent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(sizeClasses[size], className)}>
              <AvatarImage 
                src={assignedAgent.avatarUrl} 
                alt={`${assignedAgent.firstName} ${assignedAgent.lastName}`}
              />
              <AvatarFallback className="text-xs">
                {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{assignedAgent.firstName} {assignedAgent.lastName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // No agent assigned yet
  return null;
}