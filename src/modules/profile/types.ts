import { AuthProfile } from "@/modules/auth/types";
import { RoleProfileData } from "@/modules/profile/schemas";
export type Profile = AuthProfile;



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
  resume?: File | null;
};

export type UpdateAvatarPayload = FormData;

export type UpdateResumePayload = FormData;
  
