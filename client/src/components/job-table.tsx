import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Search, RefreshCw, RotateCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "@/types";

interface JobTableProps {
  jobs: Job[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  queued: {
    label: "Queued",
    variant: "secondary" as const,
    icon: Clock,
    bgColor: "bg-slate-100",
    textColor: "text-slate-800"
  },
  running: {
    label: "Running",
    variant: "default" as const,
    icon: RefreshCw,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  },
  completed: {
    label: "Completed",
    variant: "default" as const,
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    icon: AlertCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800"
  }
};

export default function JobTable({ jobs, isLoading, onRefresh }: JobTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: Job['status'] }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200" data-testid="job-table-loading">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Jobs</CardTitle>
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border border-slate-100 rounded">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200" data-testid="job-table">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900" data-testid="table-title">
            Recent Jobs
          </CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-48 text-sm"
                data-testid="input-search-jobs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 text-sm" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              data-testid="button-refresh-jobs"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="jobs-table">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Job ID</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Topic</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Progress</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Created</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500" data-testid="no-jobs-message">
                  {jobs.length === 0 ? "No jobs found" : "No jobs match your filters"}
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50" data-testid={`row-job-${job.id}`}>
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm text-slate-900" data-testid={`text-job-id-${job.id}`}>
                      {job.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-slate-900" data-testid={`text-job-topic-${job.id}`}>
                        {job.topic}
                      </p>
                      <p className="text-xs text-slate-500" data-testid={`text-job-details-${job.id}`}>
                        {job.language} • {job.targetLength}s
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6" data-testid={`status-job-${job.id}`}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Progress value={job.progress} className="flex-1 h-2" />
                      <span className="text-xs text-slate-500" data-testid={`progress-job-${job.id}`}>
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-500" data-testid={`created-job-${job.id}`}>
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                        data-testid={`button-view-job-${job.id}`}
                      >
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <p className="text-sm text-slate-500" data-testid="pagination-info">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            data-testid="button-pagination-prev"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-pagination-next"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
