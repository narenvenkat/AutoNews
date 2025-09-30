import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  RefreshCw, 
  Upload, 
  Download, 
  X, 
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobWithDetails } from "@/types";

interface JobDetailModalProps {
  job?: JobWithDetails;
  isLoading: boolean;
  error?: Error | null;
  onPublish: () => void;
  publishLoading: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export default function JobDetailModal({ 
  job, 
  isLoading, 
  error,
  onPublish, 
  publishLoading, 
  onClose,
  inline = false 
}: JobDetailModalProps) {
  const steps = [
    { key: "fetch", label: "Fetch", completed: !!job?.article },
    { key: "summarize", label: "Summarize", completed: !!job?.summary },
    { key: "tts", label: "TTS", completed: !!job?.audio },
    { key: "render", label: "Render", completed: !!job?.video },
    { key: "publish", label: "Publish", completed: !!job?.publications?.length },
  ];

  const currentStep = steps.findIndex(step => !step.completed);
  const isRunning = job?.status === "running";
  const isCompleted = job?.status === "completed";
  const isFailed = job?.status === "failed";

  const content = (
    <div className="space-y-6">
      {isLoading && (
        <div className="space-y-4" data-testid="job-detail-loading">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600" data-testid="job-detail-error">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load job details</span>
        </div>
      )}

      {job && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between" data-testid="job-detail-header">
            <div>
              <h2 className="text-xl font-bold text-slate-900" data-testid="text-job-title">
                Job Details - {job.id.slice(0, 8)}...
              </h2>
              <p className="text-slate-600" data-testid="text-job-subtitle">
                {job.topic} • {job.language} • {job.targetLength}s
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Pipeline Progress */}
          <div data-testid="pipeline-progress">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Progress</h3>
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? "bg-green-100" 
                      : index === currentStep && isRunning 
                        ? "bg-blue-100" 
                        : "bg-slate-100"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : index === currentStep && isRunning ? (
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        isFailed && index === currentStep ? "bg-red-400" : "bg-slate-400"
                      }`} />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{step.label}</span>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      step.completed ? "bg-green-200" : "bg-slate-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Summary */}
              {job.summary && (
                <div data-testid="job-summary">
                  <h4 className="text-md font-semibold text-slate-900 mb-3">Generated Summary</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 leading-relaxed" data-testid="text-summary">
                      {job.summary.text}
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      {job.summary.wordCount} words • {job.summary.language}
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Preview */}
              {job.audio && (
                <div data-testid="job-audio">
                  <h4 className="text-md font-semibold text-slate-900 mb-3">Audio Preview</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        className="w-10 h-10 rounded-full p-0"
                        data-testid="button-play-audio"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <div className="flex-1">
                        <Progress value={30} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0:15</span>
                          <span>{Math.floor(job.audio.duration / 60)}:{(job.audio.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs */}
              <div data-testid="job-logs">
                <h4 className="text-md font-semibold text-slate-900 mb-3">Execution Logs</h4>
                <div className="bg-slate-900 rounded-lg p-4 h-40 overflow-y-auto">
                  <div className="font-mono text-xs space-y-1 text-green-400">
                    <div>[{new Date().toISOString().slice(0, 19)}] INFO: Job {job.id} started</div>
                    {job.article && (
                      <div className="text-blue-400">[{new Date().toISOString().slice(0, 19)}] INFO: Article fetched successfully</div>
                    )}
                    {job.summary && (
                      <div className="text-green-400">[{new Date().toISOString().slice(0, 19)}] INFO: Summary generated ({job.summary.wordCount} words)</div>
                    )}
                    {job.audio && (
                      <div className="text-green-400">[{new Date().toISOString().slice(0, 19)}] INFO: TTS conversion completed ({job.audio.duration}s duration)</div>
                    )}
                    {job.video && (
                      <div className="text-green-400">[{new Date().toISOString().slice(0, 19)}] INFO: Video rendering completed</div>
                    )}
                    {isRunning && (
                      <div className="text-yellow-400">[{new Date().toISOString().slice(0, 19)}] INFO: Processing in progress ({job.progress}% complete)</div>
                    )}
                    {isFailed && job.error && (
                      <div className="text-red-400">[{new Date().toISOString().slice(0, 19)}] ERROR: {job.error}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Video Preview */}
              <div data-testid="job-video">
                <h4 className="text-md font-semibold text-slate-900 mb-3">Video Preview</h4>
                {job.video ? (
                  <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
                    <video 
                      controls 
                      className="max-w-full max-h-full rounded"
                      poster={job.video.urlThumb}
                      data-testid="video-player"
                    >
                      <source src={job.video.urlMp4} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        {isRunning ? (
                          <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
                        ) : (
                          <Play className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <p className="text-slate-500">
                        {isRunning ? "Video rendering in progress..." : "Video not ready"}
                      </p>
                      {isRunning && (
                        <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto mt-2">
                          <div 
                            className="h-1 bg-blue-600 rounded-full transition-all" 
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Job Information */}
              <div data-testid="job-information">
                <h4 className="text-md font-semibold text-slate-900 mb-3">Job Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Created:</span>
                    <span className="text-sm text-slate-900" data-testid="text-created-date">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Source:</span>
                    <span className="text-sm text-slate-900">GNews API</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Language:</span>
                    <span className="text-sm text-slate-900">{job.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Target Length:</span>
                    <span className="text-sm text-slate-900">{job.targetLength} seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Auto Publish:</span>
                    <span className="text-sm text-slate-900">
                      {job.autoPublish ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3" data-testid="job-actions">
                <Button
                  className="w-full"
                  onClick={onPublish}
                  disabled={!isCompleted || publishLoading || !!job.publications?.length}
                  data-testid="button-publish"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {publishLoading ? "Publishing..." : 
                   job.publications?.length ? "Published to YouTube" :
                   !isCompleted ? "Publish to YouTube (Processing...)" : 
                   "Publish to YouTube"}
                </Button>
                
                {job.video && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(job.video?.urlMp4, '_blank')}
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Assets
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full text-red-700 border-red-200 hover:bg-red-50"
                  disabled={isCompleted}
                  data-testid="button-cancel"
                >
                  <X className="w-4 h-4 mr-2" />
                  {isCompleted ? "Job Completed" : "Cancel Job"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (inline) {
    return <div className="max-w-6xl mx-auto">{content}</div>;
  }

  // Modal version (not used in current implementation but keeping for future use)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          {content}
        </div>
      </div>
    </div>
  );
}
