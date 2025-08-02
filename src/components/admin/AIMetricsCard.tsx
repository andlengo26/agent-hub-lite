import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Users, TrendingUp } from "lucide-react";
import { useChats } from "@/hooks/useApiQuery";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { categorizeChats } from "@/utils/chatFilters";
import { useMemo } from "react";

export function AIMetricsCard() {
  const { data: chatsResponse } = useChats();
  const { settings: widgetSettings } = useWidgetSettings();
  
  const chats = chatsResponse?.data || [];
  
  const metrics = useMemo(() => {
    const categorized = categorizeChats(chats, widgetSettings);
    const totalChats = chats.length;
    const aiHandledChats = chats.filter(chat => chat.handledBy === 'ai').length;
    const humanHandledChats = chats.filter(chat => chat.handledBy === 'human' || chat.assignedAgentId).length;
    const escalatedChats = chats.filter(chat => (chat as any).status === 'escalated').length;
    
    const aiResolutionRate = totalChats > 0 ? (aiHandledChats / totalChats) * 100 : 0;
    const escalationRate = totalChats > 0 ? (escalatedChats / totalChats) * 100 : 0;
    
    return {
      totalActive: categorized.aiActive.length,
      humanQueue: categorized.humanQueue.length,
      aiResolutionRate: Math.round(aiResolutionRate),
      escalationRate: Math.round(escalationRate),
      aiHandledChats,
      humanHandledChats,
      totalChats
    };
  }, [chats, widgetSettings]);

  const isAIEnabled = widgetSettings?.aiSettings?.enableAIFirst ?? false;

  if (!isAIEnabled) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI-First Routing Metrics
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          Real-time
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active AI Chats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Active AI Chats</span>
          </div>
          <Badge variant={metrics.totalActive > 0 ? "default" : "secondary"}>
            {metrics.totalActive}
          </Badge>
        </div>

        {/* Human Queue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Human Queue</span>
          </div>
          <Badge variant={metrics.humanQueue > 0 ? "destructive" : "secondary"}>
            {metrics.humanQueue}
          </Badge>
        </div>

        {/* AI Resolution Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">AI Resolution Rate</span>
            <span className="text-sm font-medium">{metrics.aiResolutionRate}%</span>
          </div>
          <Progress value={metrics.aiResolutionRate} className="h-2" />
        </div>

        {/* Escalation Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Escalation Rate</span>
            <span className="text-sm font-medium">{metrics.escalationRate}%</span>
          </div>
          <Progress 
            value={metrics.escalationRate} 
            className="h-2"
          />
        </div>

        {/* Summary Stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{metrics.aiHandledChats}</div>
              <div className="text-xs text-muted-foreground">AI Handled</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.humanHandledChats}</div>
              <div className="text-xs text-muted-foreground">Human Handled</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.totalChats}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}