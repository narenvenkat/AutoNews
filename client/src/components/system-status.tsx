import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  RefreshCw, 
  Pause, 
  BarChart3,
  AlertCircle
} from "lucide-react";

const statusColors = {
  operational: "bg-green-500",
  degraded: "bg-amber-500", 
  down: "bg-red-500"
};

const statusLabels = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down"
};

const statusTextColors = {
  operational: "text-green-600",
  degraded: "text-amber-600",
  down: "text-red-600"
};

export default function SystemStatus() {
  const { toast } = useToast();

  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'sync':
          await API.triggerSync();
          toast({
            title: "Success",
            description: "News sync triggered successfully",
          });
          break;
        case 'pause':
          await API.pauseAutomation();
          toast({
            title: "Success", 
            description: "Automation paused",
          });
          break;
        default:
          toast({
            title: "Info",
            description: "Feature coming soon",
          });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="border border-slate-200" data-testid="system-status">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900" data-testid="system-status-title">
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4" data-testid="system-status-loading">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {status && Object.entries(status).map(([service, serviceStatus]) => (
                <div key={service} className="flex items-center justify-between" data-testid={`service-${service}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${statusColors[serviceStatus.status]} rounded-full`} />
                    <span className="text-sm text-slate-600 capitalize" data-testid={`service-${service}-name`}>
                      {service === 'gnews' ? 'GNews API' : 
                       service === 'nlp' ? 'Summarization' :
                       service === 'video' ? 'Video Rendering' :
                       service === 'youtube' ? 'YouTube API' : service}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${statusTextColors[serviceStatus.status]}`} data-testid={`service-${service}-status`}>
                      {statusLabels[serviceStatus.status]}
                    </span>
                    {serviceStatus.message && (
                      <AlertCircle className="w-3 h-3 text-slate-400" title={serviceStatus.message} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-slate-200" data-testid="quick-actions">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900" data-testid="quick-actions-title">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start space-x-3 p-3 h-auto"
              onClick={() => window.location.href = '/jobs/create'}
              data-testid="button-create-manual-job"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Create Manual Job</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start space-x-3 p-3 h-auto"
              onClick={() => handleQuickAction('sync')}
              data-testid="button-trigger-sync"
            >
              <RefreshCw className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Trigger News Sync</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start space-x-3 p-3 h-auto"
              onClick={() => handleQuickAction('pause')}
              data-testid="button-pause-automation"
            >
              <Pause className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-slate-700">Pause Automation</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start space-x-3 p-3 h-auto"
              onClick={() => handleQuickAction('analytics')}
              data-testid="button-view-analytics"
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-slate-200" data-testid="recent-activity">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900" data-testid="recent-activity-title">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3" data-testid="activity-item-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">Job started video rendering</p>
                <p className="text-xs text-slate-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3" data-testid="activity-item-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">Job published to YouTube</p>
                <p className="text-xs text-slate-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3" data-testid="activity-item-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">Job failed during TTS conversion</p>
                <p className="text-xs text-slate-500">8 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
