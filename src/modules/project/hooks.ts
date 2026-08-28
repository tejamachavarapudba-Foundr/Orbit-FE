import { useCallback, useEffect, useRef, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useProjectStore } from "@/modules/project/store";
import { ProjectPayload } from "@/modules/project/types";
import { getBestLikedIds, getProjectBadge, getSortPriority } from "@/modules/project/utils";

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
  { label: "Consumer App", value: "consumer_app" },
  { label: "Mobile App", value: "mobile_app" },
  { label: "Hardware", value: "hardware" },
  { label: "AI / ML", value: "ai_ml" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech", value: "healthtech" },
  { label: "EdTech", value: "edtech" },
  { label: "Climate", value: "climate" },
  { label: "DeepTech", value: "deeptech" },
  { label: "Web3", value: "web3" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Social", value: "social" },
  { label: "Developer Tools", value: "developer_tools" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Creator Economy", value: "creator_economy" },
  { label: "Agency", value: "agency" },
  { label: "Nonprofit", value: "nonprofit" },
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
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  logoUrl: "",
  coverUrl: "",
  techStack: [],
  lookingFor: [],
  isPublished: true,
  cinNumber: "",
  dpiitNumber: ""
};

// The full Project object also carries relations, timestamps, and other
// server-owned fields (id, ownerId, founder, investorSnapshot, ...) that
// aren't part of an update payload — whitelist just the editable fields
// so they never get spread into a PATCH request.
const pickProjectPayload = (project: import("@/modules/project/types").Project): ProjectPayload => {
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

export const useProjects = () => {
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

  // Reused as-is from the existing /startups/trending algorithm — no second
  // trending calculation. Capped to the top 3 rather than tagging every id
  // the endpoint returns (up to 10): with only a handful of startups total,
  // the full response covers nearly the whole list, so every non-new card
  // ended up badged "Trending" the moment it was marked viewed.
  const trendingIds = useMemo(
    () => new Set(trendingStartups.slice(0, 3).map((startup) => startup.id)),
    [trendingStartups]
  );
  const bestLikedIds = useMemo(() => getBestLikedIds(projects), [projects]);

  // Kept as a plain Project[] (not {project, badge}[]) since other screens
  // (e.g. CreateMeetingForm's startup picker) share this same hook and only
  // want the list — badges live in a separate lookup instead.
  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project) => {
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
        })
        .sort(
          (a, b) =>
            getSortPriority(a, trendingIds.has(a.id), bestLikedIds.has(a.id)) -
            getSortPriority(b, trendingIds.has(b.id), bestLikedIds.has(b.id))
        ),
    [filters.projectType, filters.query, filters.stage, projects, trendingIds, bestLikedIds]
  );

  const badgesByProjectId = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProjectBadge>> = {};
    filteredProjects.forEach((project) => {
      map[project.id] = getProjectBadge(project, trendingIds.has(project.id), bestLikedIds.has(project.id));
    });
    return map;
  }, [filteredProjects, trendingIds, bestLikedIds]);

  return {
    projects: filteredProjects,
    badgesByProjectId,
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
      return false;
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
