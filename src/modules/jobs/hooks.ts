import { useCallback, useEffect, useMemo, useState } from "react";
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";

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

type JobsPage = { jobs: Job[]; totalCount: number; hasMore: boolean };
type JobsQueryKey = readonly ["jobs", "browse", { query: string; role: string }];

const JOBS_BROWSE_PREFIX = ["jobs", "browse"] as const;
const jobDetailKey = (id: string) => ["jobs", "detail", id] as const;
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};

const upsertJobInPage = (jobs: Job[], job: Job) => {
  const exists = jobs.some((item) => item.id === job.id);
  return exists ? jobs.map((item) => (item.id === job.id ? job : item)) : jobs;
};

// Every cached browse query (one per distinct filter combo the user has
// searched) gets patched, not just whichever one happens to be active —
// otherwise switching back to an earlier filter would show stale data
// for a job that was just edited/deleted/applied to.
const updateAllBrowsePages = (
  queryClient: QueryClient,
  updater: (jobs: Job[]) => Job[]
) => {
  queryClient.setQueriesData<InfiniteData<JobsPage, number>>(
    { queryKey: JOBS_BROWSE_PREFIX },
    (old: InfiniteData<JobsPage, number> | undefined) => {
      if (!old) return old;
      return { ...old, pages: old.pages.map((page: JobsPage) => ({ ...page, jobs: updater(page.jobs) })) };
    }
  );
};

const findJobInBrowseCache = (queryClient: QueryClient, id: string): Job | undefined => {
  const queries = queryClient.getQueriesData<InfiniteData<JobsPage, number>>({ queryKey: JOBS_BROWSE_PREFIX });
  for (const [, data] of queries) {
    const found = data?.pages.flatMap((page) => page.jobs).find((job) => job.id === id);
    if (found) return found;
  }
  return undefined;
};

export const useJobs = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ query: "", role: "all" });
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);
  const effectiveFilters = useMemo(() => ({ query: debouncedQuery, role: filters.role }), [debouncedQuery, filters.role]);

  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, error, refetch, fetchNextPage } = useInfiniteQuery({
    queryKey: [...JOBS_BROWSE_PREFIX, effectiveFilters] as JobsQueryKey,
    queryFn: ({ pageParam }) => jobsApi.browseJobs(pageParam, PAGE_SIZE, effectiveFilters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined)
  });

  const jobs: Job[] = useMemo(() => (data?.pages ?? []).flatMap((page) => page.jobs), [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const createMutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => jobsApi.createJob(payload),
    onSuccess: (job) => {
      queryClient.setQueriesData<InfiniteData<JobsPage, number>>(
        { queryKey: JOBS_BROWSE_PREFIX },
        (old: InfiniteData<JobsPage, number> | undefined) => {
          if (!old || old.pages.length === 0) return old;
          const firstPage = old.pages[0] as JobsPage;
          return { ...old, pages: [{ ...firstPage, jobs: [job, ...firstPage.jobs] }, ...old.pages.slice(1)] };
        }
      );
      useToastStore.getState().show({ type: "success", title: "Job posted" });
    },
    onError: (error) => {
      useToastStore.getState().show({ type: "error", title: "Job failed", message: toAppError(error).message });
    }
  });

  const setQuery = useCallback((query: string) => setFilters((current) => ({ ...current, query })), []);
  const setRole = useCallback((role: string) => setFilters((current) => ({ ...current, role })), []);

  const loadMore = useCallback(() => {
    if (hasNextPage) void fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

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
    jobs,
    totalCount,
    hasMore: hasNextPage ?? false,
    filters,
    isLoading,
    isRefreshing: isRefetching,
    isLoadingMore: isFetchingNextPage,
    isCreating: createMutation.isPending,
    errorMessage: error ? toAppError(error).message : null,
    setQuery,
    setRole,
    loadJobs: refetch,
    refreshJobs: refetch,
    loadMore,
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
    updateAllBrowsePages(queryClient, (jobs) => upsertJobInPage(jobs, job));
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
      updateAllBrowsePages(queryClient, (jobs) => jobs.filter((job) => job.id !== id));
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
      updateAllBrowsePages(queryClient, (jobs) =>
        jobs.map((job) => (job.id === variables.id ? appendApplication(job) : job))
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
      updateAllBrowsePages(queryClient, (jobs) =>
        jobs.map((job) => (job.id === variables.jobId ? patchApplication(job) : job))
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
    initialData: () => findJobInBrowseCache(queryClient, id)
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
