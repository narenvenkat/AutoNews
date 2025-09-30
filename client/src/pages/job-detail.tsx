import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { API } from "@/lib/api";
import Sidebar from "@/components/sidebar";
import JobDetailModal from "@/components/job-detail-modal";

export default function JobDetail() {
  const params = useParams();
  const jobId = params.id;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['/api/jobs', jobId],
    enabled: !!jobId,
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const publishMutation = useMutation({
    mutationFn: () => API.publishJob(jobId!),
    onSuccess: () => {
      API.invalidateJob(jobId!);
    },
  });

  if (!jobId) {
    return <div>Invalid job ID</div>;
  }

  return (
    <div className="flex h-screen" data-testid="job-detail-page">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6">
          <JobDetailModal
            job={job}
            isLoading={isLoading}
            error={error}
            onPublish={() => publishMutation.mutate()}
            publishLoading={publishMutation.isPending}
            inline={true}
          />
        </div>
      </main>
    </div>
  );
}
