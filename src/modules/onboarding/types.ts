import { OnboardingMemberRole } from "@/constants/memberRoles";
import { RoleProfileData } from "@/modules/profile/schemas";

export type OnboardingStep = "welcome" | "goals" | "quick_profile" | "matches";

export type QuickProfileValues = {
  fullName: string;
  headline: string;
  location: string;
  linkedinUrl: string;
  company: string;
  website: string;
  skills: string;
  /** Role-specific keyed values (startupName, fundName, expertise, etc.) */
  roleFields: Record<string, string>;
};

export type OnboardingDraft = {
  step: OnboardingStep;
  memberRole: OnboardingMemberRole | null;
  goals: string[];
  quickProfile: QuickProfileValues;
  roleProfile: RoleProfileData | null;
};

export type SaveOnboardingPayload = {
  step: OnboardingStep;
  memberRole: OnboardingMemberRole;
  goals?: string[];
  quickProfile?: Partial<QuickProfileValues>;
  roleProfile?: RoleProfileData | null;
};

export type CompleteOnboardingPayload = {
  memberRole: OnboardingMemberRole;
  goals: string[];
  quickProfile: QuickProfileValues;
  roleProfile: RoleProfileData;
};

export type OnboardingProfileResponse = {
  onboardingCompleted: boolean;
  onboardingGoals: string[];
  profileCompletion: number;
  role: string;
  roleProfile: RoleProfileData | null;
};
