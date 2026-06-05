import { useEffect, useMemo } from "react";

import { useJobsStore } from "@/modules/jobs/store";

export const jobRoleOptions = ["all", "engineer", "designer", "marketing", "sales", "operations", "product"] as const;

export const useJobs = () => {
  const jobs = useJobsStore((state) => state.jobs);
  const filters = useJobsStore((state) => state.filters);
  const isLoading = useJobsStore((state) => state.isLoading);
  const isRefreshing = useJobsStore((state) => state.isRefreshing);
  const isCreating = useJobsStore((state) => state.isCreating);
  const mutatingId = useJobsStore((state) => state.mutatingId);
  const errorMessage = useJobsStore((state) => state.errorMessage);
  const setQuery = useJobsStore((state) => state.setQuery);
  const setRole = useJobsStore((state) => state.setRole);
  const loadJobs = useJobsStore((state) => state.loadJobs);
  const refreshJobs = useJobsStore((state) => state.refreshJobs);
  const createJob = useJobsStore((state) => state.createJob);
  const selectJob = useJobsStore((state) => state.selectJob);

  useEffect(() => {
    if (!jobs.length && !isLoading) {
      void loadJobs();
    }
  }, [isLoading, jobs.length, loadJobs]);

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

  return {
    jobs: filteredJobs,
    totalCount: jobs.length,
    filters,
    isLoading,
    isRefreshing,
    isCreating,
    mutatingId,
    errorMessage,
    setQuery,
    setRole,
    loadJobs,
    refreshJobs,
    createJob,
    selectJob
  };
};

export const useJobDetail = () => {
  const selectedJob = useJobsStore((state) => state.selectedJob);
  const mutatingId = useJobsStore((state) => state.mutatingId);
  const clearSelectedJob = useJobsStore((state) => state.clearSelectedJob);
  const deleteJob = useJobsStore((state) => state.deleteJob);
  const updateJob = useJobsStore((state) => state.updateJob);
  const applyJob = useJobsStore((state) => state.applyJob);
  const updateApplicationStatus = useJobsStore((state) => state.updateApplicationStatus);

  return {
    selectedJob,
    mutatingId,
    clearSelectedJob,
    deleteJob,
    updateJob,
    applyJob,
    updateApplicationStatus
  };
};
