import { AuthProfile } from "@/modules/auth/types";

export type UserRole =
  | "all"
  | "founder"
  | "co-founder"
  | "software engineer"
  | "mentor"
  | "policy maker"
  | "investor"
  | "designer"
  | "product manager"
  | "other";

export type UserProfile = AuthProfile;

export type UserSummary = {
  id: string;
  profile: UserProfile;
  createdAt: string;
};

export type DeleteAccountResponse = {
  id: string;
  email: string;
};

export type UserFilters = {
  query: string;
  role: UserRole;
};
