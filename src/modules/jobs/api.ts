import { apiClient } from "@/services/api/client";
import {
  ApplyJobPayload,
  CreateJobPayload,
  DeleteJobResponse,
  Job,
  JobApplication,
  JobApplicationStatus,
  UpdateJobPayload
} from "@/modules/jobs/types";

export const jobsApi = {
  getJobs: async () => {
    const response = await apiClient.get<Job[]>("/jobs");
    return response.data;
  },
  getJob: async (id: string) => {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response.data;
  },
  createJob: async (payload: CreateJobPayload) => {
    const response = await apiClient.post<Job>("/jobs", payload);
    return response.data;
  },
  updateJob: async (id: string, payload: UpdateJobPayload) => {
    const response = await apiClient.patch<Job>(`/jobs/${id}`, payload);
    return response.data;
  },
  deleteJob: async (id: string) => {
    const response = await apiClient.delete<DeleteJobResponse>(`/jobs/${id}`);
    return response.data;
  },
  applyJob: async (id: string, payload: ApplyJobPayload) => {
    const response = await apiClient.post<JobApplication>(`/jobs/${id}/apply`, payload);
    return response.data;
  },
  updateApplicationStatus: async (jobId: string, appId: string, status: JobApplicationStatus) => {
    const response = await apiClient.patch<JobApplication>(`/jobs/${jobId}/applications/${appId}`, { status });
    return response.data;
  },
  getApplicationResumeUrl: async (jobId: string, appId: string) => {
    const response = await apiClient.get<{ url: string; fileName: string | null }>(
      `/jobs/${jobId}/applications/${appId}/resume`
    );
    return response.data;
  },
  getMyApplications: async () => {
    const response = await apiClient.get<(JobApplication & { job: Job })[]>("/jobs/mine/applications");
    return response.data;
  },
  getMyPosts: async () => {
    const response = await apiClient.get<Job[]>("/jobs/mine/posts");
    return response.data;
  },
  getMyAnalytics: async () => {
    const response = await apiClient.get<{
      totalPosts: number;
      totalApplications: number;
      accepted: number;
      rejected: number;
      pending: number;
      onboardCount: number;
    }>("/jobs/mine/analytics");
    return response.data;
  }
};
