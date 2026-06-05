import { create } from "zustand";

import { jobsApi } from "@/modules/jobs/api";
import { CreateJobPayload, Job, JobApplicationStatus, UpdateJobPayload } from "@/modules/jobs/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type JobFilters = {
  query: string;
  role: string;
};

type JobsState = {
  jobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  mutatingId: string | null;
  errorMessage: string | null;
  setQuery: (query: string) => void;
  setRole: (role: string) => void;
  loadJobs: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  selectJob: (id: string) => Promise<void>;
  clearSelectedJob: () => void;
  createJob: (payload: CreateJobPayload) => Promise<boolean>;
  updateJob: (id: string, payload: UpdateJobPayload) => Promise<boolean>;
  deleteJob: (id: string) => Promise<boolean>;
  applyJob: (id: string, message: string) => Promise<boolean>;
  updateApplicationStatus: (jobId: string, appId: string, status: JobApplicationStatus) => Promise<boolean>;
};

const upsertJob = (jobs: Job[], job: Job) => {
  const exists = jobs.some((item) => item.id === job.id);
  return exists ? jobs.map((item) => (item.id === job.id ? job : item)) : [job, ...jobs];
};

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  selectedJob: null,
  filters: {
    query: "",
    role: "all"
  },
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  mutatingId: null,
  errorMessage: null,
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setRole: (role) => set((state) => ({ filters: { ...state.filters, role } })),
  loadJobs: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const jobs = await jobsApi.getJobs();
      set({ jobs, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshJobs: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const jobs = await jobsApi.getJobs();
      set({ jobs, isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  selectJob: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const job = await jobsApi.getJob(id);
      set((state) => ({ jobs: upsertJob(state.jobs, job), selectedJob: job, mutatingId: null }));
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
    }
  },
  clearSelectedJob: () => set({ selectedJob: null }),
  createJob: async (payload) => {
    set({ isCreating: true, errorMessage: null });

    try {
      const job = await jobsApi.createJob(payload);
      set((state) => ({ jobs: [job, ...state.jobs], isCreating: false }));
      useToastStore.getState().show({ type: "success", title: "Job posted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isCreating: false });
      useToastStore.getState().show({ type: "error", title: "Job failed", message: appError.message });
      return false;
    }
  },
  updateJob: async (id, payload) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const job = await jobsApi.updateJob(id, payload);
      set((state) => ({ jobs: upsertJob(state.jobs, job), selectedJob: job, mutatingId: null }));
      useToastStore.getState().show({ type: "success", title: "Job updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Update failed", message: appError.message });
      return false;
    }
  },
  deleteJob: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      await jobsApi.deleteJob(id);
      set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id), selectedJob: null, mutatingId: null }));
      useToastStore.getState().show({ type: "success", title: "Job deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  },
  applyJob: async (id, message) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const application = await jobsApi.applyJob(id, { message });
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, applications: [...(job.applications ?? []), application] } : job
        ),
        selectedJob:
          state.selectedJob?.id === id
            ? { ...state.selectedJob, applications: [...(state.selectedJob.applications ?? []), application] }
            : state.selectedJob,
        mutatingId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Application sent" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Apply failed", message: appError.message });
      return false;
    }
  },
  updateApplicationStatus: async (jobId, appId, status) => {
    set({ mutatingId: appId, errorMessage: null });

    try {
      const application = await jobsApi.updateApplicationStatus(jobId, appId, status);
      const updateApplications = (job: Job) => ({
        ...job,
        applications: (job.applications ?? []).map((item) => (item.id === appId ? application : item))
      });

      set((state) => ({
        jobs: state.jobs.map((job) => (job.id === jobId ? updateApplications(job) : job)),
        selectedJob: state.selectedJob?.id === jobId ? updateApplications(state.selectedJob) : state.selectedJob,
        mutatingId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Application updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Application update failed", message: appError.message });
      return false;
    }
  }
}));
