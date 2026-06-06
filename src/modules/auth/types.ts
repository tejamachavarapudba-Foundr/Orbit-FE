export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  profile: AuthProfile;
};

import { RoleProfileData } from "@/modules/profile/schemas";

export type AuthProfile = {
  id: string;
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
  avatarUrl: string;
  onboardingCompleted?: boolean;
  onboardingGoals?: string[];
  profileCompletion?: number;
  roleProfile?: RoleProfileData | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type AuthMeResponse = {
  id: string;
  email: string;
  role?: string;
  profile: AuthProfile;
};

export type LogoutResponse = {
  message: string;
};
