import { apiClient } from "@/services/api/client";
import {
  Project,
  ProjectApplicationPayload,
  ProjectMember,
  ProjectPayload,
  ProjectReview,
  ProjectReviewPayload,
  StartupDetail,
  TrendingStartup
} from "@/modules/project/types";

export const projectApi = {
  getProjects: async () => {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
  },
  getStartups: async (page = 1, limit = 20) => {
    const response = await apiClient.get<Project[]>("/startups", {
      params: { page, limit }
    });
    return response.data;
  },
  getStartupById: async (id: string) => {
    const response = await apiClient.get<StartupDetail>(`/startups/${id}`);
    return response.data;
  },
  getTrendingStartups: async (limit = 10) => {
    const response = await apiClient.get<TrendingStartup[]>("/startups/trending", {
      params: { startups: "trending", limit }
    });
    return response.data;
  },
  getProjectById: async (id: string) => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },
  createProject: async (payload: ProjectPayload) => {
    const response = await apiClient.post<Project>("/projects", payload);
    return response.data;
  },
  updateProject: async (id: string, payload: ProjectPayload) => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return response.data;
  },
  getMembers: async (id: string) => {
    const response = await apiClient.get<ProjectMember[]>(`/projects/${id}/members`);
    return response.data;
  },
  applyToProject: async (id: string, payload: ProjectApplicationPayload) => {
    const response = await apiClient.post<string>(`/projects/${id}/applications`, payload);
    return response.data;
  },
  createReview: async (id: string, payload: ProjectReviewPayload) => {
    const response = await apiClient.post<ProjectReview>(`/startups/${id}/reviews`, payload);
    return response.data;
  }
};
