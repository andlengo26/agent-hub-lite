/**
 * Enhanced Engagement Summary Card with Timeline Integration
 * Shows summary with quick access to conversation timeline
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Eye,
  BarChart3,
  Brain
} from 'lucide-react';
import { ConversationTimeline, TimelineTransition } from './ConversationTimeline';
import { ConversationSummaryCard, ConversationSummary } from './ConversationSummaryCard';
import { CustomerEngagement } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EngagementSummaryCardProps {
  engagement: CustomerEngagement;
  transitions?: TimelineTransition[];
  conversationSummary?: ConversationSummary;
  showTimeline?: boolean;
  className?: string;
}

export function EngagementSummaryCard({
  engagement,
  transitions = [],
  conversationSummary,
  showTimeline = false,
  className
}: EngagementSummaryCardProps) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const hasAnalytics = transitions.length > 0 || conversationSummary;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Engagement Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {engagement.channel}
            </Badge>
            <span className="text-xs text-text-secondary">
              {format(new Date(engagement.date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Engagement Info */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-1">Agent Summary</h4>
            <p className="text-sm text-text-secondary">
              {engagement.aiSummary || 'No summary available'}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <MessageSquare className="h-3 w-3" />
              Agent: {engagement.agentName}
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="h-3 w-3" />
              {format(new Date(engagement.date), 'HH:mm')}
            </div>
          </div>
        </div>

        {/* Analytics Section (if available) */}
        {hasAnalytics && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Conversation Analytics
              </h4>
            </div>
            
            {/* Analytics Actions */}
            <div className="flex gap-2">
              {transitions.length > 0 && (
                <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Timeline ({transitions.length})
                      {isTimelineOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <ConversationTimeline transitions={transitions} />
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {conversationSummary && (
                <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Summary
                      {isSummaryOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <ConversationSummaryCard summary={conversationSummary} compact />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}