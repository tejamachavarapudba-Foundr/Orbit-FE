import { AuthProfile } from "@/modules/auth/types";

// Values match Prisma's MemberRole enum exactly (as stored on
// profile.role) — these used to be hyphen/space-separated display-style
// strings that never matched a real stored value, silently breaking the
// Discover role filter for every multi-word role.
export type UserRole =
  | "all"
  | "founder"
  | "co_founder"
  | "software_engineer"
  | "mentor"
  | "policy_maker"
  | "investor"
  | "designer"
  | "product_manager"
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
