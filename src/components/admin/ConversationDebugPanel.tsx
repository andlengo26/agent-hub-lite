/**
 * Debug Panel for Conversation State
 * Provides debugging tools and recovery options for development
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Trash2, Shield, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ConversationDebugPanelProps {
  messageRecovery: {
    syncConversation: () => void;
    emergencyReset: () => void;
    detectCorruption: () => boolean;
    isRecoveryInProgress: boolean;
    recoveryMetrics: { recoveries: number; skips: number; conflicts: number };
    debugMode: boolean;
  };
  conversationState: any;
  currentMessages: any[];
}

export function ConversationDebugPanel({
  messageRecovery,
  conversationState,
  currentMessages
}: ConversationDebugPanelProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Only show in debug mode
  if (!messageRecovery.debugMode) return null;
  
  const handleSyncConversation = () => {
    messageRecovery.syncConversation();
    toast({
      title: "Conversation Synced",
      description: "Manual sync completed between React state and persistence"
    });
  };
  
  const handleEmergencyReset = () => {
    if (window.confirm('Are you sure? This will clear all conversation data and cannot be undone.')) {
      messageRecovery.emergencyReset();
      toast({
        title: "Emergency Reset Complete",
        description: "All conversation data has been cleared",
        variant: "destructive"
      });
    }
  };
  
  const isCorrupted = messageRecovery.detectCorruption();
  const persistedCount = conversationState?.messages?.length || 0;
  const currentCount = currentMessages.length;
  const countMismatch = persistedCount !== currentCount;
  
  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Debug Panel - Conversation State
          <Badge variant={isCorrupted ? "destructive" : "secondary"}>
            {isCorrupted ? "Corrupted" : "Healthy"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="font-medium">Current</div>
            <div className="text-muted-foreground">{currentCount} messages</div>
          </div>
          <div>
            <div className="font-medium">Persisted</div>
            <div className="text-muted-foreground">{persistedCount} messages</div>
          </div>
          <div>
            <div className="font-medium">Status</div>
            <div className={countMismatch ? "text-orange-600" : "text-green-600"}>
              {countMismatch ? "Mismatch" : "Synced"}
            </div>
          </div>
        </div>
        
        {/* Recovery Metrics */}
        <div className="flex gap-2 text-xs">
          <Badge variant="outline">
            Recoveries: {messageRecovery.recoveryMetrics.recoveries}
          </Badge>
          <Badge variant="outline">
            Skips: {messageRecovery.recoveryMetrics.skips}
          </Badge>
          <Badge variant="outline">
            Conflicts: {messageRecovery.recoveryMetrics.conflicts}
          </Badge>
        </div>
        
        {/* Warnings */}
        {isCorrupted && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            <AlertTriangle className="h-3 w-3" />
            Data corruption detected! Consider emergency reset.
          </div>
        )}
        
        {countMismatch && !isCorrupted && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            <Info className="h-3 w-3" />
            Message count mismatch detected
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncConversation}
            disabled={messageRecovery.isRecoveryInProgress}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEmergencyReset}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Reset
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            {showDetails ? 'Hide' : 'Details'}
          </Button>
        </div>
        
        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="space-y-1">
              <div><strong>Conversation ID:</strong> {conversationState?.conversationId || 'None'}</div>
              <div><strong>Status:</strong> {conversationState?.status || 'Unknown'}</div>
              <div><strong>Last Interaction:</strong> {conversationState?.lastInteractionTime ? new Date(conversationState.lastInteractionTime).toLocaleString() : 'None'}</div>
              <div><strong>Recovery Active:</strong> {messageRecovery.isRecoveryInProgress ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}