import { useCallback, useEffect, useMemo, useState } from "react";
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/modules/auth/store";
import { projectApi } from "@/modules/project/api";
import {
  Project,
  ProjectApplicationPayload,
  ProjectFilters,
  ProjectPayload,
  ProjectReviewPayload,
  StartupDetail,
  TrendingStartup
} from "@/modules/project/types";
import { getBestLikedIds, getProjectBadge, getSortPriority } from "@/modules/project/utils";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

// Kept in sync with orbit-web's NewStartupForm.tsx stage list — same
// values on both platforms so a project's stage displays and edits
// correctly regardless of which client created or is editing it.
export const projectStageOptions = [
  { label: "All", value: "all" },
  { label: "Idea", value: "idea" },
  { label: "Prototype", value: "prototype" },
  { label: "MVP", value: "mvp" },
  { label: "Beta", value: "beta" },
  { label: "Launched", value: "launched" },
  { label: "Growth", value: "growth" },
  { label: "Scaling", value: "scaling" },
  { label: "Profitable", value: "profitable" },
  { label: "Acquired", value: "acquired" }
];

// Platform now doubles as the project's category — the old separate
// "Category" field in the create form was removed and folded into this
// list. Kept in sync with orbit-web's NewStartupForm.tsx category list
// (same values on both platforms); "ai" was renamed to the more standard
// "ai_ml" and "consumer_social" was split back into web's separate
// "consumer_app"/"social" to match — "mobility" is mobile's one addition,
// now mirrored on web too.
export const PROJECT_PLATFORM_OPTIONS = [
  { label: "SaaS", value: "saas" },
  { label: "Marketplace", value: "marketplace" },
  { label: "Consumer & D2C", value: "consumer_app" },
  { label: "AI / ML", value: "ai_ml" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech", value: "healthtech" },
  { label: "EdTech", value: "edtech" },
  { label: "Climate Tech", value: "climate" },
  { label: "DeepTech", value: "deeptech" },
  { label: "Web3", value: "web3" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Mobility", value: "mobility" },
  { label: "Other", value: "other" }
] as const;

export const projectTypeOptions = [
  { label: "All", value: "all" },
  ...PROJECT_PLATFORM_OPTIONS
];

export const FUNDING_STAGE_OPTIONS = [
  { label: "Idea Stage", value: "idea_stage" },
  { label: "Bootstrapping", value: "bootstrapping" },
  { label: "Pre-Seed Stage", value: "pre_seed_stage" },
  { label: "Seed Stage", value: "seed_stage" },
  { label: "Series A", value: "series_a" },
  { label: "Series B", value: "series_b" },
  { label: "Series C", value: "series_c" },
  { label: "Series D", value: "series_d" }
] as const;

const emptyPayload: ProjectPayload = {
  name: "",
  tagline: "",
  description: "",
  pitch: "",
  category: "saas",
  industryTags: [],
  projectType: "saas",
  stage: "idea",
  fundingStage: "bootstrapping",
  teamSize: 1,
  foundedYear: null,
  location: "",
  websiteUrl: "",
  demoUrl: "",
  pitchDeckUrl: "",
  pitchVideoUrl: "",
  askAmount: "",
  equityPercent: "",
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  logoUrl: "",
  coverUrl: "",
  techStack: [],
  lookingFor: [],
  isPublished: true,
  cinNumber: "",
  dpiitNumber: "",
  incorporationDocUrl: "",
  incorporationDocKey: "",
  incorporationReason: ""
};

// The full Project object also carries relations, timestamps, and other
// server-owned fields (id, ownerId, founder, investorSnapshot, ...) that
// aren't part of an update payload — whitelist just the editable fields
// so they never get spread into a PATCH request.
const pickProjectPayload = (project: Project): ProjectPayload => {
  const picked = {} as ProjectPayload;
  (Object.keys(emptyPayload) as (keyof ProjectPayload)[]).forEach((key) => {
    (picked[key] as unknown) = project[key] ?? emptyPayload[key];
  });
  return picked;
};

const normalize = (value: string) => value.trim().toLowerCase();

const csvToArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type ProjectsPage = { projects: Project[]; totalCount: number; hasMore: boolean };
type UploadFile = { uri: string; name: string; type: string };

const PROJECTS_BROWSE_PREFIX = ["projects", "browse"] as const;
const projectDetailKey = (id: string) => ["projects", "detail", id] as const;
const TRENDING_KEY = ["projects", "trending"] as const;
const INVESTOR_DISCOVERY_KEY = ["projects", "investor-discovery"] as const;
const SAVED_KEY = ["projects", "saved"] as const;

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

// Patches every cached browse page (any filter variant), the detail cache,
// trending, and investor discovery — a like/save/edit anywhere should be
// reflected everywhere that project might currently be shown, the same as
// the old store's single shared `projects` array did implicitly.
const patchProjectEverywhere = (queryClient: QueryClient, id: string, patch: (project: Project) => Project) => {
  queryClient.setQueriesData<InfiniteData<ProjectsPage, number>>(
    { queryKey: PROJECTS_BROWSE_PREFIX },
    (old: InfiniteData<ProjectsPage, number> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page: ProjectsPage) => ({
          ...page,
          projects: page.projects.map((project) => (project.id === id ? patch(project) : project))
        }))
      };
    }
  );
  queryClient.setQueryData<StartupDetail>(projectDetailKey(id), (old: StartupDetail | undefined) =>
    old ? ({ ...old, ...patch(old) } as StartupDetail) : old
  );
  queryClient.setQueryData<TrendingStartup[]>(TRENDING_KEY, (old: TrendingStartup[] | undefined) =>
    old?.map((project) => (project.id === id ? ({ ...project, ...patch(project) } as TrendingStartup) : project))
  );
  queryClient.setQueryData<Project[]>(INVESTOR_DISCOVERY_KEY, (old: Project[] | undefined) =>
    old?.map((project) => (project.id === id ? patch(project) : project))
  );
};

export const useSavedStartups = () => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isRefetching, refetch } = useQuery({
    queryKey: SAVED_KEY,
    queryFn: projectApi.getSavedStartups,
    enabled: Boolean(currentUserId)
  });

  const list = (data as { project: Project; projectId: string }[] | undefined) ?? [];
  const savedStartups = useMemo(() => list.map((item) => item.project), [list]);
  const savedStartupIds = useMemo(() => list.map((item) => item.projectId), [list]);

  return { savedStartups, savedStartupIds, isRefreshing: isRefetching, refresh: refetch };
};

export const useInvestorDiscovery = () => {
  const { data } = useQuery({
    queryKey: INVESTOR_DISCOVERY_KEY,
    queryFn: projectApi.getInvestorDiscovery
  });

  return { investorStartups: data ?? [] };
};

// Shared by every screen that can like/save/view/upload-to an arbitrary
// project (ProjectCard's like+save buttons, the pitch reels feed, project
// detail's logo/cover upload) — each call site gets its own mutation
// instances, so an upload on one card's id no longer shows a loading state
// on unrelated cards.
export const useProjectMutations = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const { savedStartupIds } = useSavedStartups();

  const toggleLikeMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.toggleLike(projectId),
    onMutate: async (projectId: string) => {
      // Optimistic — flip immediately, roll back only if the request
      // fails, so the like button feels instant instead of waiting on a
      // round trip.
      const flip = (project: Project) => ({
        ...project,
        isLikedByMe: !project.isLikedByMe,
        likeCount: (project.likeCount ?? 0) + (project.isLikedByMe ? -1 : 1)
      });
      patchProjectEverywhere(queryClient, projectId, flip);
    },
    onError: (error, projectId) => {
      const flipBack = (project: Project) => ({
        ...project,
        isLikedByMe: !project.isLikedByMe,
        likeCount: (project.likeCount ?? 0) + (project.isLikedByMe ? -1 : 1)
      });
      patchProjectEverywhere(queryClient, projectId, flipBack);
      showToast({ type: "error", title: "Couldn't like that", message: toAppError(error).message });
    }
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const isSaved = savedStartupIds.includes(projectId);
      if (isSaved) {
        await projectApi.unsaveStartup(projectId);
      } else {
        await projectApi.saveStartup(projectId);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVED_KEY });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Save failed", message: toAppError(error).message });
    }
  });

  const markViewedMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.markViewed(projectId),
    onMutate: (projectId: string) => {
      patchProjectEverywhere(queryClient, projectId, (project) => ({ ...project, isViewedByMe: true }));
    }
    // Non-critical — badge state just stays optimistic if this fails, same
    // as the old store's silent catch.
  });

  const updateLogoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: UploadFile }) => projectApi.updateLogo(id, file),
    onSuccess: (project) => {
      patchProjectEverywhere(queryClient, project.id, (existing) => ({ ...existing, ...project }));
      showToast({ type: "success", title: "Logo updated" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Logo update failed", message: toAppError(error).message });
    }
  });

  const updateCoverMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: UploadFile }) => projectApi.updateCover(id, file),
    onSuccess: (project) => {
      patchProjectEverywhere(queryClient, project.id, (existing) => ({ ...existing, ...project }));
      showToast({ type: "success", title: "Cover updated" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Cover update failed", message: toAppError(error).message });
    }
  });

  const updatePitchVideoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: UploadFile }) => projectApi.updatePitchVideo(id, file),
    onSuccess: (project) => {
      patchProjectEverywhere(queryClient, project.id, (existing) => ({ ...existing, ...project }));
      showToast({ type: "success", title: "Pitch video uploaded" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Pitch video upload failed", message: toAppError(error).message });
    }
  });

  const toggleLikeStartup = useCallback((id: string) => toggleLikeMutation.mutateAsync(id), [toggleLikeMutation]);
  const toggleSaveStartup = useCallback((id: string) => toggleSaveMutation.mutateAsync(id), [toggleSaveMutation]);
  const markStartupViewed = useCallback((id: string) => markViewedMutation.mutateAsync(id), [markViewedMutation]);

  const updateLogo = useCallback(
    async (id: string, file: UploadFile) => {
      try {
        await updateLogoMutation.mutateAsync({ id, file });
        return true;
      } catch {
        return false;
      }
    },
    [updateLogoMutation]
  );

  const updateCover = useCallback(
    async (id: string, file: UploadFile) => {
      try {
        await updateCoverMutation.mutateAsync({ id, file });
        return true;
      } catch {
        return false;
      }
    },
    [updateCoverMutation]
  );

  const updatePitchVideo = useCallback(
    async (id: string, file: UploadFile) => {
      try {
        const project = await updatePitchVideoMutation.mutateAsync({ id, file });
        return project;
      } catch {
        return null;
      }
    },
    [updatePitchVideoMutation]
  );

  return {
    savedStartupIds,
    toggleLikeStartup,
    toggleSaveStartup,
    markStartupViewed,
    updateLogo,
    updateCover,
    updatePitchVideo,
    isSubmitting: updateLogoMutation.isPending || updateCoverMutation.isPending || updatePitchVideoMutation.isPending
  };
};

export const useProjects = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProjectFilters>({ query: "", stage: "all", projectType: "all" });
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);
  const effectiveFilters = useMemo(
    () => ({ query: debouncedQuery, stage: filters.stage, projectType: filters.projectType }),
    [debouncedQuery, filters.stage, filters.projectType]
  );

  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, error, refetch, fetchNextPage } = useInfiniteQuery({
    queryKey: [...PROJECTS_BROWSE_PREFIX, effectiveFilters],
    queryFn: ({ pageParam }) => projectApi.browseProjects(pageParam, PAGE_SIZE, effectiveFilters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined)
  });

  const { data: trendingStartups } = useQuery<TrendingStartup[]>({
    queryKey: TRENDING_KEY,
    queryFn: () => projectApi.getTrendingStartups()
  });

  const projects: Project[] = useMemo(() => (data?.pages ?? []).flatMap((page) => page.projects), [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const createMutation = useMutation({
    mutationFn: (payload: ProjectPayload) => projectApi.createProject(payload),
    onSuccess: (project) => {
      queryClient.setQueriesData<InfiniteData<ProjectsPage, number>>(
        { queryKey: PROJECTS_BROWSE_PREFIX },
        (old: InfiniteData<ProjectsPage, number> | undefined) => {
          if (!old || old.pages.length === 0) return old;
          const firstPage = old.pages[0] as ProjectsPage;
          return { ...old, pages: [{ ...firstPage, projects: [project, ...firstPage.projects] }, ...old.pages.slice(1)] };
        }
      );
      showToastStore().show({ type: "success", title: "Project created" });
    },
    onError: (error) => {
      showToastStore().show({ type: "error", title: "Project failed", message: toAppError(error).message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) => projectApi.updateProject(id, payload),
    onSuccess: (project) => {
      patchProjectEverywhere(queryClient, project.id, (existing) => ({ ...existing, ...project }));
      showToastStore().show({ type: "success", title: "Project updated" });
    },
    onError: (error) => {
      showToastStore().show({ type: "error", title: "Update failed", message: toAppError(error).message });
    }
  });

  // Reused as-is from the existing /startups/trending algorithm — no second
  // trending calculation. Capped to the top 3 rather than tagging every id
  // the endpoint returns (up to 10): with only a handful of startups total,
  // the full response covers nearly the whole list, so every non-new card
  // ended up badged "Trending" the moment it was marked viewed.
  const trendingIds = useMemo(
    () => new Set((trendingStartups ?? []).slice(0, 3).map((startup: TrendingStartup) => startup.id)),
    [trendingStartups]
  );
  const bestLikedIds = useMemo(() => getBestLikedIds(projects), [projects]);

  // Kept as a plain Project[] (not {project, badge}[]) since other screens
  // (e.g. CreateMeetingForm's startup picker) share this same hook and only
  // want the list — badges live in a separate lookup instead.
  const filteredProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          getSortPriority(a, trendingIds.has(a.id), bestLikedIds.has(a.id)) -
          getSortPriority(b, trendingIds.has(b.id), bestLikedIds.has(b.id))
      ),
    [projects, trendingIds, bestLikedIds]
  );

  const badgesByProjectId = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProjectBadge>> = {};
    filteredProjects.forEach((project) => {
      map[project.id] = getProjectBadge(project, trendingIds.has(project.id), bestLikedIds.has(project.id));
    });
    return map;
  }, [filteredProjects, trendingIds, bestLikedIds]);

  const loadMore = useCallback(() => {
    if (hasNextPage) void fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const setQuery = useCallback((query: string) => setFilters((current) => ({ ...current, query })), []);
  const setStage = useCallback((stage: string) => setFilters((current) => ({ ...current, stage })), []);
  const setProjectType = useCallback((projectType: string) => setFilters((current) => ({ ...current, projectType })), []);

  const createProject = useCallback(
    async (payload: ProjectPayload) => {
      try {
        const project = await createMutation.mutateAsync(payload);
        return project;
      } catch {
        return null;
      }
    },
    [createMutation]
  );

  const updateProject = useCallback(
    async (id: string, payload: ProjectPayload) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  return {
    projects: filteredProjects,
    badgesByProjectId,
    totalCount,
    hasMore: hasNextPage ?? false,
    filters,
    isLoading,
    isRefreshing: isRefetching,
    isLoadingMore: isFetchingNextPage,
    errorMessage: error ? toAppError(error).message : null,
    loadProjects: refetch,
    refreshProjects: refetch,
    loadMore,
    setQuery,
    setStage,
    setProjectType,
    createProject,
    updateProject,
    isSubmitting: createMutation.isPending || updateMutation.isPending
  };
};

// Zustand's getState() equivalent for a lazily-imported toast store, kept
// as a tiny helper since createMutation/updateMutation above are defined
// inside useProjects (a hook) but don't need to be, and importing the
// store directly at module scope avoided a circular subscribe.
const showToastStore = () => useToastStore.getState();

export const useProjectForm = (existingProject?: Project | null) => {
  const { createProject, updateProject, isSubmitting } = useProjects();
  const isEditing = Boolean(existingProject);

  const initialValues = existingProject
    ? {
        ...pickProjectPayload(existingProject),
        industryTagsText: existingProject.industryTags.join(", "),
        techStackText: existingProject.techStack.join(", "),
        lookingForText: existingProject.lookingFor.join(", ")
      }
    : { ...emptyPayload, industryTagsText: "", techStackText: "", lookingForText: "" };

  const [values, setValues] = useState(initialValues);

  const setField = useCallback(<Key extends keyof typeof values>(key: Key, value: (typeof values)[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!values.name.trim() || !values.description.trim()) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { industryTagsText, techStackText, lookingForText, ...projectFields } = values;
    const payload: ProjectPayload = {
      ...projectFields,
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      websiteUrl: values.websiteUrl.trim(),
      cinNumber: values.cinNumber.trim(),
      dpiitNumber: values.dpiitNumber.trim(),
      incorporationReason: values.incorporationReason.trim(),
      askAmount: values.askAmount.trim(),
      equityPercent: values.equityPercent.trim(),
      industryTags: csvToArray(values.industryTagsText),
      techStack: csvToArray(values.techStackText),
      lookingFor: csvToArray(values.lookingForText)
    };

    // No reset-to-empty here on success — every current caller closes or
    // navigates away immediately after a successful submit, so resetting
    // the still-mounted form only produced a visible flash of empty fields
    // in the instant before that happens. The next genuinely new project
    // gets a fresh mount (and fresh empty state) naturally.
    if (existingProject) {
      const didSucceed = await updateProject(existingProject.id, payload);
      return didSucceed ? existingProject : null;
    }
    return createProject(payload);
  }, [createProject, updateProject, existingProject, values]);

  return {
    values,
    setField,
    submit,
    isSubmitting,
    isEditing,
    // Every field is required except dpiitNumber (and the pitch video,
    // which ProjectComposer ANDs in separately as hasPitchVideo since it
    // isn't part of this hook's plain string/number fields).
    canSubmit: Boolean(
      values.name.trim() &&
        values.tagline.trim() &&
        values.description.trim() &&
        values.projectType.trim() &&
        values.stage.trim() &&
        values.fundingStage.trim() &&
        values.foundedYear &&
        values.location.trim() &&
        values.cinNumber.trim() &&
        values.websiteUrl.trim() &&
        values.askAmount.trim() &&
        values.equityPercent.trim() &&
        values.techStackText.trim() &&
        values.lookingForText.trim() &&
        (values.incorporationDocUrl.trim() || values.incorporationReason.trim())
    )
  };
};

export const useProjectDetail = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const showToast = useToastStore((state) => state.show);
  const { markStartupViewed } = useProjectMutations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applicationRole, setApplicationRole] = useState("co_founder");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: selectedProject, isLoading: isDetailLoading, error } = useQuery<StartupDetail>({
    queryKey: projectDetailKey(selectedId ?? ""),
    queryFn: () => projectApi.getStartupById(selectedId as string),
    enabled: Boolean(selectedId)
  });

  useEffect(() => {
    // Also patches the browse-list cache's isViewedByMe (see
    // useProjectMutations), not just this detail query, matching the old
    // store's selectProject() which called the same cache-aware action.
    if (selectedId) {
      void markStartupViewed(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const applyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectApplicationPayload }) => projectApi.applyToProject(id, payload),
    onSuccess: () => {
      showToast({ type: "success", title: "Application sent" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Application failed", message: toAppError(error).message });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectReviewPayload }) => projectApi.createReview(id, payload),
    onSuccess: (review, variables) => {
      queryClient.setQueryData<StartupDetail>(projectDetailKey(variables.id), (old: StartupDetail | undefined) =>
        old ? { ...old, reviews: [review, ...old.reviews] } : old
      );
      showToast({ type: "success", title: "Review posted" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Review failed", message: toAppError(error).message });
    }
  });

  const members: StartupDetail["members"] = selectedProject?.members ?? [];
  const reviews: StartupDetail["reviews"] = selectedProject?.reviews ?? [];
  const applications: StartupDetail["applications"] = selectedProject?.applications ?? [];

  const selectProject = useCallback(async (id: string) => {
    setSelectedId(id);
  }, []);

  const clearSelectedProject = useCallback(() => setSelectedId(null), []);

  const submitApplication = useCallback(async () => {
    if (!selectedProject || !applicationMessage.trim()) {
      return false;
    }

    try {
      await applyMutation.mutateAsync({
        id: selectedProject.id,
        payload: { role: applicationRole, message: applicationMessage.trim() }
      });
      setApplicationMessage("");
      return true;
    } catch {
      return false;
    }
  }, [applicationMessage, applicationRole, applyMutation, selectedProject]);

  const submitReview = useCallback(async () => {
    if (!selectedProject || !reviewComment.trim()) {
      return false;
    }

    try {
      await reviewMutation.mutateAsync({ id: selectedProject.id, payload: { rating: reviewRating, comment: reviewComment.trim() } });
      setReviewComment("");
      setReviewRating(5);
      return true;
    } catch {
      return false;
    }
  }, [reviewMutation, reviewComment, reviewRating, selectedProject]);

  return {
    currentUserId,
    selectedProject: selectedProject ?? null,
    members,
    reviews,
    applications,
    isDetailLoading,
    applyingProjectId: applyMutation.isPending ? applyMutation.variables?.id ?? null : null,
    reviewingProjectId: reviewMutation.isPending ? reviewMutation.variables?.id ?? null : null,
    detailErrorMessage: error ? toAppError(error).message : null,
    selectProject,
    clearSelectedProject,
    applicationRole,
    setApplicationRole,
    applicationMessage,
    setApplicationMessage,
    submitApplication,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    submitReview
  };
};
