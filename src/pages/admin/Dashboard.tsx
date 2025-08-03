import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@/hooks/useApiQuery";
import { useFeatureFlags } from "@/hooks/useFeatureFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wrench } from "lucide-react";
import { useState } from "react";
import { AIMetricsCard } from "@/components/admin/AIMetricsCard";
import { WaitTimeAnalytics } from "@/components/admin/WaitTimeAnalytics";

export default function Dashboard() {
  const { data: healthData, isLoading: healthLoading, error: healthError, refetch } = useHealthCheck();
  const featureFlags = useFeatureFlags();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const enabledFeatures = Object.entries(featureFlags)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  // Enhanced health status determination
  const getHealthStatus = () => {
    if (healthLoading || isRefreshing) return { status: 'checking', color: 'yellow', icon: AlertTriangle };
    if (healthError) {
      return { status: 'error', color: 'destructive', icon: XCircle };
    }
    return { status: 'healthy', color: 'success', icon: CheckCircle };
  };

  const handleRefreshHealth = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const healthStatus = getHealthStatus();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Customer Support AI Agent admin portal
        </p>
      </div>

      {/* Enhanced System Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              System Status
              <healthStatus.icon className={`h-5 w-5 text-${healthStatus.color}`} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHealth}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthStatus.status === 'error' ? (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <div>System health check failed. Operating in fallback mode.</div>
                  <details className="text-xs">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-1 p-2 bg-muted rounded overflow-auto">
                      {healthError?.message || 'Unknown error'}
                    </pre>
                  </details>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  API Status: {healthStatus.status === 'checking' ? 'Checking...' : 'Online'}
                </span>
                {healthData && (
                  <Badge variant="outline">
                    Version {healthData.version}
                  </Badge>
                )}
                {healthData && (
                  <Badge variant="secondary">
                    Last checked: {new Date(healthData.timestamp).toLocaleTimeString()}
                  </Badge>
                )}
              </div>
              
              {import.meta.env.DEV && (
                <div className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2">Development Mode</Badge>
                  Static Mock Data: Active
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {enabledFeatures.map((feature) => (
              <Badge key={feature} variant="secondary">
                {feature}
              </Badge>
            ))}
            {enabledFeatures.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No advanced features enabled
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💬</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏱️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
            <p className="text-xs text-muted-foreground">
              -15% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⭐</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Metrics and Analytics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AIMetricsCard />
        <WaitTimeAnalytics />
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dashboard Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced analytics, real-time monitoring, and comprehensive reporting features 
              will be available here. This dashboard will provide insights into chat volume, 
              agent performance, customer satisfaction, and AI efficiency metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}