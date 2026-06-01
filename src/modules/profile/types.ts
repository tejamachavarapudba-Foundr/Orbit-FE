import { AuthProfile } from "@/modules/auth/types";

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
};

export type UpdateAvatarPayload = {
  avatarUrl: string;
};
