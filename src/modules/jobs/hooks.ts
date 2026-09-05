import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { jobsApi } from "@/modules/jobs/api";
import { CreateJobPayload, Job, JobApplicationStatus, UpdateJobPayload } from "@/modules/jobs/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

export const jobRoleOptions = [
  "all",
  "engineer",
  "designer",
  "marketing",
  "sales",
  "operations",
  "product",
  "advisor",
  "mentor"
] as const;

const JOBS_LIST_KEY = ["jobs", "list"] as const;
const jobDetailKey = (id: string) => ["jobs", "detail", id] as const;

const upsertJob = (jobs: Job[], job: Job) => {
  const exists = jobs.some((item) => item.id === job.id);
  return exists ? jobs.map((item) => (item.id === job.id ? job : item)) : [job, ...jobs];
};

export const useJobs = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ query: "", role: "all" });

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: JOBS_LIST_KEY,
    queryFn: jobsApi.getJobs
  });
  const jobs: Job[] = data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => jobsApi.createJob(payload),
    onSuccess: (job) => {
      queryClient.setQueryData<Job[]>(JOBS_LIST_KEY, (old: Job[] | undefined) => [job, ...(old ?? [])]);
      useToastStore.getState().show({ type: "success", title: "Job posted" });
    },
    onError: (error) => {
      useToastStore.getState().show({ type: "error", title: "Job failed", message: toAppError(error).message });
    }
  });

  const setQuery = useCallback((query: string) => setFilters((current) => ({ ...current, query })), []);
  const setRole = useCallback((role: string) => setFilters((current) => ({ ...current, role })), []);

  const filteredJobs = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesRole = filters.role === "all" || job.role.toLowerCase() === filters.role;
      const haystack = [job.heading, job.startupName, job.role, job.experience, job.description, ...job.skills]
        .join(" ")
        .toLowerCase();
      return matchesRole && (!query || haystack.includes(query));
    });
  }, [filters.query, filters.role, jobs]);

  const createJob = useCallback(
    async (payload: CreateJobPayload) => {
      try {
        await createMutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
    [createMutation]
  );

  return {
    jobs: filteredJobs,
    totalCount: jobs.length,
    filters,
    isLoading,
    isRefreshing: isRefetching,
    isCreating: createMutation.isPending,
    errorMessage: error ? toAppError(error).message : null,
    setQuery,
    setRole,
    loadJobs: refetch,
    refreshJobs: refetch,
    createJob
  };
};

// Shared by every screen that can mutate an arbitrary job/application by id
// (job detail's apply button, "My posts" edit/delete, "My applications"
// accept/reject) — each call site gets its own mutation instances, so a
// mutation on one card's id no longer shows a loading state on unrelated
// cards the way the single global Zustand flag used to.
export const useJobMutations = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const syncJob = (job: Job) => {
    queryClient.setQueryData<Job[]>(JOBS_LIST_KEY, (old: Job[] | undefined) => (old ? upsertJob(old, job) : old));
    queryClient.setQueryData<Job>(jobDetailKey(job.id), job);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJobPayload }) => jobsApi.updateJob(id, payload),
    onSuccess: (job) => {
      syncJob(job);
      showToast({ type: "success", title: "Job updated" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Update failed", message: toAppError(error).message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.deleteJob(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Job[]>(JOBS_LIST_KEY, (old: Job[] | undefined) => old?.filter((job) => job.id !== id));
      queryClient.removeQueries({ queryKey: jobDetailKey(id) });
      showToast({ type: "success", title: "Job deleted" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Delete failed", message: toAppError(error).message });
    }
  });

  const applyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => jobsApi.applyJob(id, { message }),
    onSuccess: (application, variables) => {
      const appendApplication = (job: Job) => ({ ...job, applications: [...(job.applications ?? []), application] });
      queryClient.setQueryData<Job[]>(JOBS_LIST_KEY, (old: Job[] | undefined) =>
        old?.map((job) => (job.id === variables.id ? appendApplication(job) : job))
      );
      queryClient.setQueryData<Job>(jobDetailKey(variables.id), (old: Job | undefined) =>
        old ? appendApplication(old) : old
      );
      showToast({ type: "success", title: "Application sent" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Apply failed", message: toAppError(error).message });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, appId, status }: { jobId: string; appId: string; status: JobApplicationStatus }) =>
      jobsApi.updateApplicationStatus(jobId, appId, status),
    onSuccess: (application, variables) => {
      const patchApplication = (job: Job) => ({
        ...job,
        applications: (job.applications ?? []).map((item) => (item.id === variables.appId ? application : item))
      });
      queryClient.setQueryData<Job[]>(JOBS_LIST_KEY, (old: Job[] | undefined) =>
        old?.map((job) => (job.id === variables.jobId ? patchApplication(job) : job))
      );
      queryClient.setQueryData<Job>(jobDetailKey(variables.jobId), (old: Job | undefined) =>
        old ? patchApplication(old) : old
      );
      showToast({ type: "success", title: "Application updated" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Application update failed", message: toAppError(error).message });
    }
  });

  const mutatingId =
    (updateMutation.isPending ? updateMutation.variables?.id : null) ??
    (deleteMutation.isPending ? deleteMutation.variables : null) ??
    (applyMutation.isPending ? applyMutation.variables?.id : null) ??
    (statusMutation.isPending ? statusMutation.variables?.appId : null) ??
    null;

  const updateJob = useCallback(
    async (id: string, payload: UpdateJobPayload) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation]
  );

  const applyJob = useCallback(
    async (id: string, message: string) => {
      try {
        await applyMutation.mutateAsync({ id, message });
        return true;
      } catch {
        return false;
      }
    },
    [applyMutation]
  );

  const updateApplicationStatus = useCallback(
    async (jobId: string, appId: string, status: JobApplicationStatus) => {
      try {
        await statusMutation.mutateAsync({ jobId, appId, status });
        return true;
      } catch {
        return false;
      }
    },
    [statusMutation]
  );

  return { mutatingId, updateJob, deleteJob, applyJob, updateApplicationStatus };
};

export const useJobDetail = (id: string) => {
  const queryClient = useQueryClient();
  const jobMutations = useJobMutations();

  const { data: selectedJob, isLoading, error, refetch } = useQuery<Job | undefined>({
    queryKey: jobDetailKey(id),
    queryFn: () => jobsApi.getJob(id),
    initialData: () => queryClient.getQueryData<Job[]>(JOBS_LIST_KEY)?.find((job) => job.id === id)
  });

  return {
    selectedJob: selectedJob ?? null,
    isLoading,
    errorMessage: error ? toAppError(error).message : null,
    mutatingId: jobMutations.mutatingId,
    selectJob: refetch,
    applyJob: jobMutations.applyJob,
    deleteJob: jobMutations.deleteJob,
    updateJob: jobMutations.updateJob,
    updateApplicationStatus: jobMutations.updateApplicationStatus
  };
};
