import { useCallback, useEffect, useRef, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useProjectStore } from "@/modules/project/store";
import { ProjectPayload } from "@/modules/project/types";

export const useInvestorDiscovery = () => {
  const userId = useAuthStore(
    (state) => state.user?.id
    );
  const investorStartups =
    useProjectStore(
      (state) => state.investorStartups
    );
 
  const loadInvestorDiscovery =
    useProjectStore(
      (state) => state.loadInvestorDiscovery
    );

    const loadSavedStartups =
  useProjectStore(
    (state) => state.loadSavedStartups
  );

  useEffect(() => {
    void loadInvestorDiscovery();
  }, []);


  useEffect(() => {
    if (userId) {
      void loadSavedStartups();
    }
  }, [userId, loadSavedStartups]);

  return {
    investorStartups,
  };
};

 

export const projectStageOptions = [
  { label: "All", value: "all" },
  { label: "Idea", value: "idea" },
  { label: "MVP", value: "mvp" },
  { label: "Prototype", value: "prototype" },
  { label: "Growth", value: "growth" }
];

// Platform now doubles as the project's category — the old separate
// "Category" field in the create form was removed and folded into this list.
export const PROJECT_PLATFORM_OPTIONS = [
  { label: "AI", value: "ai" },
  { label: "SaaS", value: "saas" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech", value: "healthtech" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "DeepTech", value: "deeptech" },
  { label: "Mobility", value: "mobility" },
  { label: "Consumer & Social Platforms", value: "consumer_social" }
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
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  logoUrl: "",
  coverUrl: "",
  techStack: [],
  lookingFor: [],
  isPublished: true
};

const normalize = (value: string) => value.trim().toLowerCase();

const csvToArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const useProjects = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const projects = useProjectStore((state) => state.projects);
  const filters = useProjectStore((state) => state.filters);
  const isLoading = useProjectStore((state) => state.isLoading);
  const isRefreshing = useProjectStore((state) => state.isRefreshing);
  const errorMessage = useProjectStore((state) => state.errorMessage);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const loadSavedStartups = useProjectStore((state) => state.loadSavedStartups);
  const loadViewedStartups = useProjectStore((state) => state.loadViewedStartups);
  const refreshProjects = useProjectStore((state) => state.refreshProjects);
  const loadStartups = useProjectStore((state) => state.loadStartups);
  const loadTrendingStartups = useProjectStore((state) => state.loadTrendingStartups);
  const trendingStartups = useProjectStore((state) => state.trendingStartups);
  const viewedStartupIds = useProjectStore((state) => state.viewedStartupIds);
  const setQuery = useProjectStore((state) => state.setQuery);
  const setStage = useProjectStore((state) => state.setStage);
  const setProjectType = useProjectStore((state) => state.setProjectType);
  const hasLoaded = useRef(false);
  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }
  
    hasLoaded.current = true;
  
    void Promise.all([
      loadProjects(),
      loadStartups(),
      loadTrendingStartups(),
      loadSavedStartups(),
    ]);
  }, []);

  useEffect(() => {
    if (userId) {
      void loadViewedStartups(userId);
    }
  }, [userId, loadViewedStartups]);

  const viewedSet = useMemo(() => new Set(viewedStartupIds), [viewedStartupIds]);

  const newStartups = useMemo(
    () => projects.filter((startup) => !viewedSet.has(startup.id)),
    [projects, viewedSet],
  );

  const viewedStartups = useMemo(
    () => projects.filter((startup) => viewedSet.has(startup.id)),
    [projects, viewedSet],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const query = normalize(filters.query);
        const matchesQuery = !query
          ? true
          : [
              project.name,
              project.tagline,
              project.description,
              project.category,
              project.projectType,
              project.stage,
              project.location,
              ...project.techStack,
              ...project.lookingFor,
              ...project.industryTags
            ]
              .map(normalize)
              .some((value) => value.includes(query));
        const matchesStage = filters.stage === "all" || project.stage === filters.stage;
        const matchesType = filters.projectType === "all" || project.projectType === filters.projectType;

        return matchesQuery && matchesStage && matchesType;
      }),
    [filters.projectType, filters.query, filters.stage, projects]
  );

  return {
    projects: filteredProjects,
    trendingStartups,
    newStartups,
    viewedStartups,
    totalCount: filteredProjects.length,
    filters,
    isLoading,
    isRefreshing,
    errorMessage,
    loadProjects,
    refreshProjects,
    setQuery,
    setStage,
    setProjectType
  };
};

export const useProjectForm = (existingProject?: import("@/modules/project/types").Project | null) => {
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const isSubmitting = useProjectStore((state) => state.isSubmitting);
  const isEditing = Boolean(existingProject);

  const initialValues = existingProject
    ? {
        ...emptyPayload,
        ...existingProject,
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
      return false;
    }

    const payload = {
      ...values,
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      websiteUrl: values.websiteUrl.trim(),
      industryTags: csvToArray(values.industryTagsText),
      techStack: csvToArray(values.techStackText),
      lookingFor: csvToArray(values.lookingForText)
    };

    const didSucceed = existingProject
      ? await updateProject(existingProject.id, payload)
      : await createProject(payload);

    if (didSucceed && !existingProject) {
      setValues({ ...emptyPayload, industryTagsText: "", techStackText: "", lookingForText: "" });
    }

    return didSucceed;
  }, [createProject, updateProject, existingProject, values]);

  return {
    values,
    setField,
    submit,
    isSubmitting,
    isEditing,
    canSubmit: Boolean(values.name.trim() && values.description.trim())
  };
};

export const useProjectDetail = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const membersByProjectId = useProjectStore((state) => state.membersByProjectId);
  const isDetailLoading = useProjectStore((state) => state.isDetailLoading);
  const applyingProjectId = useProjectStore((state) => state.applyingProjectId);
  const reviewingProjectId = useProjectStore((state) => state.reviewingProjectId);
  const detailErrorMessage = useProjectStore((state) => state.detailErrorMessage);
  const selectProject = useProjectStore((state) => state.selectProject);
  const clearSelectedProject = useProjectStore((state) => state.clearSelectedProject);
  const applyToProject = useProjectStore((state) => state.applyToProject);
  const createReview = useProjectStore((state) => state.createReview);
  const [applicationRole, setApplicationRole] = useState("co_founder");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const members = selectedProject ? selectedProject.members ?? membersByProjectId[selectedProject.id] ?? [] : [];
  const reviews = selectedProject?.reviews ?? [];
  const applications = selectedProject?.applications ?? [];

  const submitApplication = useCallback(async () => {
    if (!selectedProject || !applicationMessage.trim()) {
      return false;
    }

    const didSucceed = await applyToProject(selectedProject.id, {
      role: applicationRole,
      message: applicationMessage.trim()
    });

    if (didSucceed) {
      setApplicationMessage("");
    }

    return didSucceed;
  }, [applicationMessage, applicationRole, applyToProject, selectedProject]);

  const submitReview = useCallback(async () => {
    if (!selectedProject || !reviewComment.trim()) {
      return false;
    }

    const didSucceed = await createReview(selectedProject.id, {
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    if (didSucceed) {
      setReviewComment("");
      setReviewRating(5);
    }

    return didSucceed;
  }, [createReview, reviewComment, reviewRating, selectedProject]);

  return {
    currentUserId,
    selectedProject,
    members,
    reviews,
    applications,
    isDetailLoading,
    applyingProjectId,
    reviewingProjectId,
    detailErrorMessage,
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
