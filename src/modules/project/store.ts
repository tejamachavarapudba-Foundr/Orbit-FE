import { create } from "zustand";

import { projectApi } from "@/modules/project/api";
import {
  Project,
  ProjectApplicationPayload,
  ProjectFilters,
  ProjectMember,
  ProjectPayload,
  ProjectReviewPayload,
  StartupDetail,
  TrendingStartup
} from "@/modules/project/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type ProjectState = {
  projects: Project[];
  startups: Project[];
  trendingStartups: TrendingStartup[];
  selectedProject: StartupDetail | null;
  membersByProjectId: Record<string, ProjectMember[]>;
  filters: ProjectFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  isDetailLoading: boolean;
  applyingProjectId: string | null;
  reviewingProjectId: string | null;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  investorStartups: Project[];
  savedStartupIds: string[];
  savedStartups: Project[];
  loadSavedStartups: () => Promise<void>;
  markStartupViewed: (projectId: string) => Promise<void>;
  toggleSaveStartup: (projectId: string) => Promise<void>;
  toggleLikeStartup: (projectId: string) => Promise<void>;
  loadProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  loadStartups: () => Promise<void>;
  loadTrendingStartups: () => Promise<void>;
  loadInvestorDiscovery: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  clearSelectedProject: () => void;
  createProject: (payload: ProjectPayload) => Promise<boolean>;
  updateProject: (id: string, payload: ProjectPayload) => Promise<boolean>;
  updateLogo: (id: string, file: { uri: string; name: string; type: string }) => Promise<boolean>;
  updateCover: (id: string, file: { uri: string; name: string; type: string }) => Promise<boolean>;
  updatePitchVideo: (id: string, file: { uri: string; name: string; type: string }) => Promise<boolean>;
  loadMembers: (id: string) => Promise<void>;
  applyToProject: (id: string, payload: ProjectApplicationPayload) => Promise<boolean>;
  createReview: (id: string, payload: ProjectReviewPayload) => Promise<boolean>;
  setQuery: (query: string) => void;
  setStage: (stage: string) => void;
  setProjectType: (projectType: string) => void;
};

const sortProjects = (projects: Project[]) =>
  [...projects].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  startups: [],
  trendingStartups: [],
  investorStartups: [],
  selectedProject: null,
  membersByProjectId: {},
  filters: { query: "", stage: "all", projectType: "all" },
  isLoading: false,
  isRefreshing: false,
  isSubmitting: false,
  isDetailLoading: false,
  applyingProjectId: null,
  reviewingProjectId: null,
  errorMessage: null,
  detailErrorMessage: null,
  savedStartupIds: [],
  savedStartups: [],

  loadProjects: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const projects = await projectApi.getProjects();
      set({ projects: sortProjects(projects), isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshProjects: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const projects = await projectApi.getProjects();
      set({ projects: sortProjects(projects), isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  loadStartups: async () => {
    try {
      const startups = await projectApi.getStartups();
      set({ startups: sortProjects(startups) });
    } catch {
      set({ startups: [] });
    }
  },
  loadTrendingStartups: async () => {
    try {
      const trendingStartups = await projectApi.getTrendingStartups();
      set({ trendingStartups });
    } catch {
      set({ trendingStartups: [] });
    }
  },
  loadSavedStartups: async () => {
    try {
      const saved =
        await projectApi.getSavedStartups();
  
      set({
        savedStartups: saved.map(
          (item: any) => item.project
        ),
  
        savedStartupIds: saved.map(
          (item: any) => item.projectId
        ),
      });
    } catch {
      set({
        savedStartups: [],
        savedStartupIds: [],
      });
    }
  },
  // Backend-tracked now (StartupView table) instead of device-local storage
  // — "viewed" used to reset on reinstall/new device, now follows the account.
  markStartupViewed: async (projectId) => {
    const state = useProjectStore.getState();
    const target = state.projects.find((project) => project.id === projectId);
    if (target?.isViewedByMe) {
      return;
    }

    set((current) => ({
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, isViewedByMe: true } : project
      )
    }));

    try {
      await projectApi.markViewed(projectId);
    } catch {
      // Non-critical — badge state just stays optimistic until the next full reload.
    }
  },
  toggleSaveStartup: async (
    projectId,
  ) => {
    const state =
      useProjectStore.getState();
  
    const isSaved =
      state.savedStartupIds.includes(
        projectId
      );
  
    try {
      if (isSaved) {
        await projectApi.unsaveStartup(
          projectId
        );
      } else {
        await projectApi.saveStartup(
          projectId
        );
      }
  
      await state.loadSavedStartups();
    } catch (error) {
      const appError = toAppError(error);
    
      useToastStore.getState().show({
        type: "error",
        title: "Save failed",
        message: appError.message,
      });
    }
  },
  toggleLikeStartup: async (projectId) => {
    // Optimistic — flip immediately, roll back only if the request fails,
    // so the like button feels instant instead of waiting on a round trip.
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              isLikedByMe: !project.isLikedByMe,
              likeCount: (project.likeCount ?? 0) + (project.isLikedByMe ? -1 : 1)
            }
          : project
      )
    }));

    try {
      await projectApi.toggleLike(projectId);
    } catch (error) {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                isLikedByMe: !project.isLikedByMe,
                likeCount: (project.likeCount ?? 0) + (project.isLikedByMe ? -1 : 1)
              }
            : project
        )
      }));
      const appError = toAppError(error);
      useToastStore.getState().show({ type: "error", title: "Couldn't like that", message: appError.message });
    }
  },
  loadInvestorDiscovery: async () => {
    try {
      const startups =
        await projectApi.getInvestorDiscovery();
  
      set({
        investorStartups: startups,
      });
    } catch {
      set({
        investorStartups: [],
      });
    }
  },
  selectProject: async (id) => {
    set({ isDetailLoading: true, detailErrorMessage: null });

    void useProjectStore.getState().markStartupViewed(id);

    try {
      const selectedProject = await projectApi.getStartupById(id);
      set((state) => ({
        selectedProject,
        membersByProjectId: { ...state.membersByProjectId, [id]: selectedProject.members },
        isDetailLoading: false
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ detailErrorMessage: appError.message, isDetailLoading: false });
    }
  },
  clearSelectedProject: () => set({ selectedProject: null, detailErrorMessage: null }),
  createProject: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const project = await projectApi.createProject(payload);
      set((state) => ({ projects: sortProjects([project, ...state.projects]), isSubmitting: false }));
      useToastStore.getState().show({ type: "success", title: "Project created" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Project failed", message: appError.message });
      return false;
    }
  },
  updateProject: async (id, payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const project = await projectApi.updateProject(id, payload);
      set((state) => ({
        projects: sortProjects(state.projects.map((item) => (item.id === id ? project : item))),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...project } : state.selectedProject,
        isSubmitting: false
      }));
      useToastStore.getState().show({ type: "success", title: "Project updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Update failed", message: appError.message });
      return false;
    }
  },
  updateLogo: async (id, file) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const project = await projectApi.updateLogo(id, file);
      set((state) => ({
        projects: sortProjects(state.projects.map((item) => (item.id === id ? { ...item, ...project } : item))),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...project } : state.selectedProject,
        isSubmitting: false
      }));
      useToastStore.getState().show({ type: "success", title: "Logo updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Logo update failed", message: appError.message });
      return false;
    }
  },
  updateCover: async (id, file) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const project = await projectApi.updateCover(id, file);
      set((state) => ({
        projects: sortProjects(state.projects.map((item) => (item.id === id ? { ...item, ...project } : item))),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...project } : state.selectedProject,
        isSubmitting: false
      }));
      useToastStore.getState().show({ type: "success", title: "Cover updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Cover update failed", message: appError.message });
      return false;
    }
  },
  updatePitchVideo: async (id, file) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const project = await projectApi.updatePitchVideo(id, file);
      set((state) => ({
        projects: sortProjects(state.projects.map((item) => (item.id === id ? { ...item, ...project } : item))),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...project } : state.selectedProject,
        isSubmitting: false
      }));
      useToastStore.getState().show({ type: "success", title: "Pitch video uploaded" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Pitch video upload failed", message: appError.message });
      return false;
    }
  },
  loadMembers: async (id) => {
    try {
      const members = await projectApi.getMembers(id);
      set((state) => ({ membersByProjectId: { ...state.membersByProjectId, [id]: members } }));
    } catch {
      set((state) => ({ membersByProjectId: { ...state.membersByProjectId, [id]: [] } }));
    }
  },
  applyToProject: async (id, payload) => {
    set({ applyingProjectId: id, errorMessage: null });

    try {
      await projectApi.applyToProject(id, payload);
      set({ applyingProjectId: null });
      useToastStore.getState().show({ type: "success", title: "Application sent" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ applyingProjectId: null, errorMessage: appError.message });
      useToastStore.getState().show({ type: "error", title: "Application failed", message: appError.message });
      return false;
    }
  },
  createReview: async (id, payload) => {
    set({ reviewingProjectId: id, errorMessage: null });

    try {
      const review = await projectApi.createReview(id, payload);
      set((state) => ({
        selectedProject:
          state.selectedProject?.id === id
            ? {
                ...state.selectedProject,
                reviews: [review, ...state.selectedProject.reviews]
              }
            : state.selectedProject,
        reviewingProjectId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Review posted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ reviewingProjectId: null, errorMessage: appError.message });
      useToastStore.getState().show({ type: "error", title: "Review failed", message: appError.message });
      return false;
    }
  },
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setStage: (stage) => set((state) => ({ filters: { ...state.filters, stage } })),
  setProjectType: (projectType) => set((state) => ({ filters: { ...state.filters, projectType } }))
}));
