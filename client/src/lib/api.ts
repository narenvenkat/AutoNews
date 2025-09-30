import { apiRequest, queryClient } from "./queryClient";
import type { 
  Job, 
  JobWithDetails, 
  Metrics, 
  SystemStatus, 
  JobFilters, 
  PaginatedResponse
} from "../types";
import type { InsertJob } from "@shared/schema";

export class API {
  // Jobs
  static async getJobs(params: {
    page?: number;
    limit?: number;
    filters?: JobFilters;
  } = {}): Promise<PaginatedResponse<Job>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
    }

    const response = await apiRequest('GET', `/api/jobs?${searchParams}`);
    return response.json();
  }

  static async getJob(id: string): Promise<JobWithDetails> {
    const response = await apiRequest('GET', `/api/jobs/${id}`);
    return response.json();
  }

  static async createJob(data: Omit<InsertJob, 'status' | 'progress' | 'steps'>): Promise<Job> {
    const response = await apiRequest('POST', '/api/jobs', data);
    return response.json();
  }

  static async publishJob(id: string): Promise<void> {
    await apiRequest('POST', `/api/jobs/${id}/publish`);
  }

  static async deleteJob(id: string): Promise<void> {
    await apiRequest('DELETE', `/api/jobs/${id}`);
  }

  // System
  static async getMetrics(): Promise<Metrics> {
    const response = await apiRequest('GET', '/api/metrics');
    return response.json();
  }

  static async getSystemStatus(): Promise<SystemStatus> {
    const response = await apiRequest('GET', '/api/system/status');
    return response.json();
  }

  static async triggerSync(): Promise<void> {
    await apiRequest('POST', '/api/system/sync');
  }

  static async pauseAutomation(): Promise<void> {
    await apiRequest('POST', '/api/system/pause');
  }

  static async resumeAutomation(): Promise<void> {
    await apiRequest('POST', '/api/system/resume');
  }

  // Cache invalidation helpers
  static invalidateJobs(): void {
    queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
  }

  static invalidateJob(id: string): void {
    queryClient.invalidateQueries({ queryKey: ['/api/jobs', id] });
  }

  static invalidateMetrics(): void {
    queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
  }

  static invalidateSystemStatus(): void {
    queryClient.invalidateQueries({ queryKey: ['/api/system/status'] });
  }
}
