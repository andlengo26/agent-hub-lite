import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { waitTimeService } from "@/services/waitTimeService";
import { useEffect, useState } from "react";

interface WaitTimeAnalyticsProps {
  className?: string;
}

export function WaitTimeAnalytics({ className }: WaitTimeAnalyticsProps) {
  const [stats, setStats] = useState(waitTimeService.getWaitTimeStats());

  useEffect(() => {
    // Update stats every minute
    const interval = setInterval(() => {
      setStats(waitTimeService.getWaitTimeStats());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 1) return "< 1m";
    return `${Math.round(minutes)}m`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Wait Time Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Missed by Timeout</span>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {stats.totalMissedByTimeout}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Avg Wait Time</span>
              </div>
              <div className="text-2xl font-bold text-secondary">
                {formatTime(stats.averageWaitTime)}
              </div>
            </div>
          </div>

          {Object.keys(stats.waitTimeDistribution).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Wait Time Distribution</h4>
              <div className="space-y-1">
                {Object.entries(stats.waitTimeDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([bucket, count]) => (
                    <div key={bucket} className="flex items-center justify-between text-xs">
                      <span>{formatTime(parseInt(bucket))}-{formatTime(parseInt(bucket) + 5)}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}