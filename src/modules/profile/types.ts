import { AuthProfile } from "@/modules/auth/types";

export type Profile = AuthProfile;

import { RoleProfileData } from "@/modules/profile/schemas";

export type UpdateProfilePayload = {
  fullName: string;
  headline: string;
  bio: string;
  role: string;
  location: string;
  company: string;
  website: string;
  linkedinUrl: string;
  skills: string[];
  lookingFor: string[];
  openToConnect: boolean;
  onboardingCompleted?: boolean;
  onboardingGoals?: string[];
  profileCompletion?: number;
  roleProfile?: RoleProfileData | null;
};

export type UpdateAvatarPayload = {
  avatarUrl: string;
};
