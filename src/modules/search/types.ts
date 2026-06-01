import { AuthProfile } from "@/modules/auth/types";
import { Post } from "@/modules/post/types";
import { Project } from "@/modules/project/types";

export type SearchType = "all" | "users" | "projects" | "jobs" | "events" | "posts";

export type SearchUser = {
  id: string;
  email: string;
  role?: string;
  isBanned?: boolean;
  createdAt: string;
  updatedAt: string;
  profile: AuthProfile;
};

export type SearchJob = {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  createdAt?: string;
};

export type SearchEvent = {
  id: string;
  title?: string;
  name?: string;
  location?: string;
  description?: string;
  startsAt?: string;
  createdAt?: string;
};

export type SearchGroupedResults = {
  users: SearchUser[];
  projects: Project[];
  jobs: SearchJob[];
  events: SearchEvent[];
  posts: Post[];
};

export type SearchStateResult = SearchGroupedResults & {
  totalCount: number;
};
