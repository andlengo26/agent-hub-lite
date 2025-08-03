/**
 * Conversation Summary Card Component
 * Displays AI-generated conversation summaries with key insights
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertTriangle,
  Star,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyTopics: string[];
  outcome: 'resolved' | 'escalated' | 'abandoned' | 'timeout';
  customerSatisfaction?: 'satisfied' | 'neutral' | 'unsatisfied';
  resolutionTime: number; // in minutes
  messageCount: number;
  handoffRequested: boolean;
  createdAt: string;
}

interface ConversationSummaryCardProps {
  summary: ConversationSummary;
  className?: string;
  compact?: boolean;
}

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'escalated':
      return <Users className="h-4 w-4" />;
    case 'timeout':
      return <Clock className="h-4 w-4" />;
    case 'abandoned':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'resolved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'escalated':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'timeout':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'abandoned':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getSatisfactionIcon = (satisfaction?: string) => {
  switch (satisfaction) {
    case 'satisfied':
      return <Star className="h-3 w-3 fill-current" />;
    case 'neutral':
      return <Star className="h-3 w-3" />;
    case 'unsatisfied':
      return <Star className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
};

export function ConversationSummaryCard({ 
  summary, 
  className, 
  compact = false 
}: ConversationSummaryCardProps) {
  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn("gap-1", getOutcomeColor(summary.outcome))}>
                {getOutcomeIcon(summary.outcome)}
                {summary.outcome}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock className="h-3 w-3" />
                {summary.resolutionTime}m
              </div>
            </div>
            
            <p className="text-sm text-text-primary line-clamp-2">
              {summary.summary}
            </p>
            
            {summary.keyTopics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {summary.keyTopics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {summary.keyTopics.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{summary.keyTopics.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Conversation Summary
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("gap-1", getOutcomeColor(summary.outcome))}>
            {getOutcomeIcon(summary.outcome)}
            {summary.outcome}
          </Badge>
          <div className="text-xs text-text-secondary">
            {format(new Date(summary.createdAt), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Text */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Summary</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {summary.summary}
          </p>
        </div>
        
        <Separator />
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock className="h-3 w-3" />
                Resolution Time
              </div>
              <span className="text-sm font-medium text-text-primary">
                {summary.resolutionTime} minutes
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MessageSquare className="h-3 w-3" />
                Messages
              </div>
              <span className="text-sm font-medium text-text-primary">
                {summary.messageCount}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {summary.handoffRequested && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Users className="h-3 w-3" />
                  Human Handoff
                </div>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  Requested
                </Badge>
              </div>
            )}
            
            {summary.customerSatisfaction && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  {getSatisfactionIcon(summary.customerSatisfaction)}
                  Satisfaction
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    summary.customerSatisfaction === 'satisfied' && "bg-green-50 text-green-700 border-green-200",
                    summary.customerSatisfaction === 'neutral' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                    summary.customerSatisfaction === 'unsatisfied' && "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {summary.customerSatisfaction}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Key Topics */}
        {summary.keyTopics.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                <Tag className="h-3 w-3" />
                Key Topics
              </div>
              <div className="flex flex-wrap gap-1">
                {summary.keyTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}