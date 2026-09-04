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
  askAmount: string;
  equityPercent: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  coverUrl: string;
  techStack: string[];
  lookingFor: string[];
  isPublished: boolean;
  cinNumber: string;
  dpiitNumber: string;
  incorporationDocUrl: string;
  incorporationDocKey: string;
  incorporationReason: string;
  incorporationVerificationStatus: "pending" | "approved" | "rejected" | null;
  createdAt: string;
  updatedAt: string;
  founderVerified?: boolean;
  likeCount?: number;
  teamMemberCount?: number;
  isLikedByMe?: boolean;
  isViewedByMe?: boolean;

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
  askAmount: string;
  equityPercent: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  coverUrl: string;
  techStack: string[];
  lookingFor: string[];
  isPublished: boolean;
  cinNumber: string;
  dpiitNumber: string;
  incorporationDocUrl: string;
  incorporationDocKey: string;
  incorporationReason: string;
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

export type PitchReel = {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  pitchVideoUrl: string;
  ownerId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
};

export type PitchReelsPage = {
  items: PitchReel[];
  nextCursor: string | null;
};

export type ProjectComment = {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author: AuthProfile;
};
