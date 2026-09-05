import { apiClient } from "@/services/api/client";
import {
  PitchReelsPage,
  Project,
  ProjectApplicationPayload,
  ProjectComment,
  ProjectMember,
  ProjectPayload,
  ProjectReview,
  ProjectReviewPayload,
  StartupDetail,
  TrendingStartup
} from "@/modules/project/types";

type ProjectsPage = { projects: Project[]; totalCount: number; hasMore: boolean };

export const projectApi = {
  getProjects: async () => {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
  },
  browseProjects: async (
    page: number,
    limit: number,
    filters: { query: string; stage: string; projectType: string }
  ) => {
    const response = await apiClient.get<ProjectsPage>("/projects/browse", {
      params: {
        page,
        limit,
        query: filters.query || undefined,
        stage: filters.stage !== "all" ? filters.stage : undefined,
        projectType: filters.projectType !== "all" ? filters.projectType : undefined
      }
    });
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
  updateLogo: async (id: string, file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    // Do not set Content-Type manually — axios/React Native need to generate
    // the multipart boundary themselves, which a fixed header value prevents.
    const response = await apiClient.patch<Project>(`/projects/${id}/logo`, formData);
    return response.data;
  },
  updateCover: async (id: string, file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    const response = await apiClient.patch<Project>(`/projects/${id}/cover`, formData);
    return response.data;
  },
  updatePitchVideo: async (id: string, file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    const response = await apiClient.patch<Project>(`/projects/${id}/pitch-video`, formData);
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
  },
  getInvestorDiscovery: async () => {
    const response =
      await apiClient.get<Project[]>(
        "/startups/investor-discovery"
      );
  
    return response.data;
  },
  saveStartup: async (id: string) => {
    const response =
      await apiClient.post(
        `/projects/${id}/save`
      );
  
    return response.data;
  },
  unsaveStartup: async (id: string) => {
    const response =
      await apiClient.delete(
        `/projects/${id}/save`
      );
  
    return response.data;
  },
  getSavedStartups: async () => {
    const response =
      await apiClient.get(
        "/projects/saved/list"
      );

    return response.data;
  },
  toggleLike: async (id: string) => {
    const response = await apiClient.post<{ liked: boolean }>(`/projects/${id}/like`);
    return response.data;
  },
  markViewed: async (id: string) => {
    const response = await apiClient.post<{ viewed: boolean }>(`/projects/${id}/view`);
    return response.data;
  },
  getReels: async (cursor?: string, limit = 10) => {
    const response = await apiClient.get<PitchReelsPage>("/projects/reels", {
      params: { cursor, limit }
    });
    return response.data;
  },
  getProjectComments: async (projectId: string) => {
    const response = await apiClient.get<ProjectComment[]>(`/projects/${projectId}/comments`);
    return response.data;
  },
  postProjectComment: async (projectId: string, content: string) => {
    const response = await apiClient.post<ProjectComment>(`/projects/${projectId}/comments`, { content });
    return response.data;
  },
  deleteProjectComment: async (commentId: string) => {
    const response = await apiClient.delete(`/project-comments/${commentId}`);
    return response.data;
  }
};
