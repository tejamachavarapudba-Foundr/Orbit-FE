import { useCallback, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    void loadInvestorDiscovery();
  }, []);

  return {
    investorStartups,
  };

  useEffect(() => {
    if (userId) {
      void loadSavedStartups();
    }
  }, [userId, loadSavedStartups]);
};

export const projectStageOptions = [
  { label: "All", value: "all" },
  { label: "Idea", value: "idea" },
  { label: "MVP", value: "mvp" },
  { label: "Prototype", value: "prototype" },
  { label: "Growth", value: "growth" }
];

export const projectTypeOptions = [
  { label: "All", value: "all" },
  { label: "SaaS", value: "saas" },
  { label: "App", value: "app" },
  { label: "Marketplace", value: "marketplace" },
  { label: "AI", value: "ai" }
];

const emptyPayload: ProjectPayload = {
  name: "",
  tagline: "",
  description: "",
  pitch: "",
  category: "app",
  industryTags: [],
  projectType: "saas",
  stage: "idea",
  fundingStage: "bootstrapped",
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
  const refreshProjects = useProjectStore((state) => state.refreshProjects);
  const loadStartups = useProjectStore((state) => state.loadStartups);
  const loadTrendingStartups = useProjectStore((state) => state.loadTrendingStartups);
  const trendingStartups = useProjectStore((state) => state.trendingStartups);
  const setQuery = useProjectStore((state) => state.setQuery);
  const setStage = useProjectStore((state) => state.setStage);
  const setProjectType = useProjectStore((state) => state.setProjectType);

  useEffect(() => {
    if (projects.length === 0 && !isLoading) {
      void loadProjects();
      void loadStartups();
      void loadTrendingStartups();
      void loadSavedStartups();
    }
  }, [isLoading, loadProjects, loadStartups, loadTrendingStartups, loadSavedStartups, projects.length]);

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

export const useProjectForm = () => {
  const createProject = useProjectStore((state) => state.createProject);
  const isSubmitting = useProjectStore((state) => state.isSubmitting);
  const [values, setValues] = useState({
    ...emptyPayload,
    industryTagsText: "",
    techStackText: "",
    lookingForText: ""
  });

  const setField = useCallback(<Key extends keyof typeof values>(key: Key, value: (typeof values)[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!values.name.trim() || !values.description.trim()) {
      return false;
    }

    const didSucceed = await createProject({
      ...values,
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      websiteUrl: values.websiteUrl.trim(),
      industryTags: csvToArray(values.industryTagsText),
      techStack: csvToArray(values.techStackText),
      lookingFor: csvToArray(values.lookingForText)
    });

    if (didSucceed) {
      setValues({ ...emptyPayload, industryTagsText: "", techStackText: "", lookingForText: "" });
    }

    return didSucceed;
  }, [createProject, values]);

  return { values, setField, submit, isSubmitting, canSubmit: Boolean(values.name.trim() && values.description.trim()) };
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
