import { AuthProfile } from "@/modules/auth/types";
import { Post } from "@/modules/post/types";

export type AdminStats = {
  overview: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    totalProjects: number;
    totalJobs: number;
    totalMessages: number;
    conversionRate: string;
  };
  growthMetrics: {
    projectsByStage: { stage: string; count: number }[];
  };
  systemStatus: {
    databaseConnected: boolean;
    timestamp: string;
  };
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  profile: AuthProfile;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    totalItems: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages: number;
    currentPage: number;
  };
};

export type BanUserPayload = {
  reason: string;
};

export type BanUserResponse = {
  id: string;
  email: string;
  isBanned: boolean;
  updatedAt: string;
};

export type AdminTab = "overview" | "users" | "posts";

export type AdminPostDeleteResponse = Post;
