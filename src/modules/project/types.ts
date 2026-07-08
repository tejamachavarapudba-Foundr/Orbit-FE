import { AuthProfile } from "@/modules/auth/types";

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  description: string;
  pitch: string;
  category: string;
  industryTags: string[];
  projectType: string;
  stage: string;
  fundingStage: string;
  teamSize: number;
  foundedYear: number | null;
  location: string;
  websiteUrl: string;
  demoUrl: string;
  pitchDeckUrl: string;
  pitchVideoUrl: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  coverUrl: string;
  techStack: string[];
  lookingFor: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;

  investorSnapshot?: {
    completionPercentage: number;
    isCompleted: boolean;
    isInvestorReady: boolean;

    mrr: number | null;
    arr: number | null;

    amountRaising: number | null;
    equityOffered: number | null;
  };
};

export type ProjectReview = {
  id: string;
  projectId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ProjectApplication = {
  id: string;
  projectId: string;
  applicantId: string;
  role: string;
  message: string;
  status: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StartupMember = {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: AuthProfile;
};

export type StartupDetail = Project & {
  founder: AuthProfile;
  applications: ProjectApplication[];
  posts: unknown[];
  reviews: ProjectReview[];
  members: StartupMember[];
};

export type TrendingStartup = Project & {
  _count: {
    applications: number;
    members: number;
    reviews: number;
  };
  baseScore: number;
  trendingScore: number;
};

export type ProjectPayload = {
  name: string;
  tagline: string;
  description: string;
  pitch: string;
  category: string;
  industryTags: string[];
  projectType: string;
  stage: string;
  fundingStage: string;
  teamSize: number;
  foundedYear: number | null;
  location: string;
  websiteUrl: string;
  demoUrl: string;
  pitchDeckUrl: string;
  pitchVideoUrl: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  coverUrl: string;
  techStack: string[];
  lookingFor: string[];
  isPublished: boolean;
};

export type ProjectMember = {
  id: string;
  role: string;
  userId: string;
};

export type ProjectApplicationPayload = {
  role: string;
  message: string;
  jobId?: string;
};

export type ProjectReviewPayload = {
  rating: number;
  comment: string;
};

export type ProjectFilters = {
  query: string;
  stage: string;
  projectType: string;
};
