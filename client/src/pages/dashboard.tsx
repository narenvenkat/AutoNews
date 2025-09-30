import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import Sidebar from "@/components/sidebar";
import KPICards from "@/components/kpi-cards";
import JobTable from "@/components/job-table";
import SystemStatus from "@/components/system-status";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FolderSync, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [isTriggering, setIsTriggering] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: () => API.getJobs({ page: 1, limit: 10 }),
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const handleTriggerSync = async () => {
    try {
      setIsTriggering(true);
      await API.triggerSync();
      toast({
        title: "Success",
        description: "News sync triggered successfully",
      });
      // Refetch data after sync
      setTimeout(() => {
        refetchJobs();
        API.invalidateMetrics();
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger sync",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="flex h-screen" data-testid="dashboard">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4" data-testid="header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900" data-testid="title">Dashboard</h2>
              <p className="text-slate-600" data-testid="subtitle">Monitor your automated news pipeline</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-500" data-testid="last-sync">
                <FolderSync className="w-4 h-4" />
                <span>Last sync: 2 min ago</span>
              </div>
              <Button
                onClick={handleTriggerSync}
                disabled={isTriggering}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-trigger-sync"
              >
                <FolderSync className={`w-4 h-4 mr-2 ${isTriggering ? 'animate-spin' : ''}`} />
                Trigger FolderSync
              </Button>
              <Link href="/jobs/create">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-job">
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <KPICards metrics={metrics} isLoading={metricsLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <JobTable 
                jobs={jobs?.data || []} 
                isLoading={jobsLoading}
                onRefresh={refetchJobs}
              />
            </div>
            
            <div className="space-y-6">
              <SystemStatus />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
