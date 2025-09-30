export interface Job {
  id: string;
  topic: string;
  language: string;
  targetLength: number;
  autoPublish: boolean;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  steps: string[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobWithDetails extends Job {
  article?: Article;
  summary?: Summary;
  audio?: AudioFile;
  video?: Video;
  publications?: Publication[];
}

export interface Article {
  id: string;
  jobId: string;
  source: string;
  url: string;
  title: string;
  content: string;
  contentHash: string;
  mediaUrl?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Summary {
  id: string;
  jobId: string;
  text: string;
  wordCount: number;
  language: string;
  qualityFlags: Record<string, any>;
  createdAt: string;
}

export interface AudioFile {
  id: string;
  jobId: string;
  url: string;
  duration: number;
  sampleRate: number;
  format: string;
  size?: number;
  createdAt: string;
}

export interface Video {
  id: string;
  jobId: string;
  urlMp4: string;
  urlSrt?: string;
  urlThumb?: string;
  width: number;
  height: number;
  duration: number;
  size?: number;
  createdAt: string;
}

export interface Publication {
  id: string;
  jobId: string;
  platform: string;
  videoId: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

export interface SystemStatus {
  gnews: ServiceStatus;
  nlp: ServiceStatus;
  video: ServiceStatus;
  youtube: ServiceStatus;
}

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  message?: string;
}

export interface Metrics {
  jobsToday: number;
  successRate: number;
  avgRenderTime: string;
  published: number;
  activeJobs: number;
  totalJobs: number;
}

export interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface InsertJob {
  topic: string;
  language: string;
  targetLength: number;
  autoPublish: boolean;
}

export interface JobFilters {
  status?: string;
  topic?: string;
  language?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
