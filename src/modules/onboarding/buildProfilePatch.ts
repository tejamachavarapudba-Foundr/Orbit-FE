import { OnboardingMemberRole } from "@/constants/memberRoles";
import { UpdateProfilePayload } from "@/modules/profile/types";
import {
  emptyAdvisorProfile,
  emptyFounderProfile,
  emptyInvestorProfile,
  emptyProfessionalProfile,
  emptyServiceProviderProfile,
  RoleProfileData
} from "@/modules/profile/schemas";
import { CompleteOnboardingPayload, QuickProfileValues, SaveOnboardingPayload } from "@/modules/onboarding/types";
import { calculateProfileCompletion } from "@/modules/profile/completion";

const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const mergeRoleProfile = (
  memberRole: OnboardingMemberRole,
  goals: string[],
  quick: Partial<QuickProfileValues> | undefined,
  existing: RoleProfileData | null | undefined
): RoleProfileData => {
  const roleFields = quick?.roleFields ?? {};

  switch (memberRole) {
    case "founder": {
      const prior = existing?.role === "founder" ? existing.data : emptyFounderProfile();
      return {
        role: "founder",
        data: {
          ...prior,
          startupName: roleFields.startupName ?? quick?.company ?? prior.startupName,
          startupStage: roleFields.startupStage ?? prior.startupStage,
          industry: fromCsv(roleFields.industry ?? "").length ? fromCsv(roleFields.industry ?? "") : prior.industry,
          website: roleFields.website ?? quick?.website ?? prior.website,
          founderStatus: roleFields.founderStatus ?? prior.founderStatus,
          currentRole: roleFields.currentRole ?? prior.currentRole,
          goals
        }
      };
    }
    case "investor": {
      const prior = existing?.role === "investor" ? existing.data : emptyInvestorProfile();
      return {
        role: "investor",
        data: {
          ...prior,
          fundName: roleFields.fundName ?? quick?.company ?? prior.fundName,
          investorType: roleFields.investorType ?? prior.investorType,
          investmentRange: roleFields.investmentRange ?? prior.investmentRange,
          investmentStage: fromCsv(roleFields.investmentStage ?? "").length
            ? fromCsv(roleFields.investmentStage ?? "")
            : prior.investmentStage,
          industries: fromCsv(roleFields.industries ?? "").length ? fromCsv(roleFields.industries ?? "") : prior.industries,
          yearsInvestingExperience: roleFields.yearsInvestingExperience ?? prior.yearsInvestingExperience,
          goals
        }
      };
    }
    case "advisor": {
      const prior = existing?.role === "advisor" ? existing.data : emptyAdvisorProfile();
      return {
        role: "advisor",
        data: {
          ...prior,
          expertise: fromCsv(roleFields.expertise ?? "").length ? fromCsv(roleFields.expertise ?? "") : prior.expertise,
          yearsExperience: roleFields.yearsExperience ?? prior.yearsExperience,
          goals
        }
      };
    }
    case "professional": {
      const prior = existing?.role === "professional" ? existing.data : emptyProfessionalProfile();
      return {
        role: "professional",
        data: {
          ...prior,
          skills: fromCsv(roleFields.skills ?? quick?.skills ?? "").length
            ? fromCsv(roleFields.skills ?? quick?.skills ?? "")
            : prior.skills,
          experienceLevel: roleFields.experienceLevel ?? prior.experienceLevel,
          specialization: roleFields.specialization ?? prior.specialization,
          specializationOther: roleFields.specializationOther ?? prior.specializationOther,
          goals
        }
      };
    }
    case "service_provider": {
      const prior = existing?.role === "service_provider" ? existing.data : emptyServiceProviderProfile();
      return {
        role: "service_provider",
        data: {
          ...prior,
          company: roleFields.company ?? quick?.company ?? prior.company,
          services: fromCsv(roleFields.services ?? "").length ? fromCsv(roleFields.services ?? "") : prior.services,
          website: roleFields.website ?? quick?.website ?? prior.website,
          goals
        }
      };
    }
  }
};

export const buildProfilePatchFromOnboarding = (
  payload: SaveOnboardingPayload | CompleteOnboardingPayload
): UpdateProfilePayload & {
  onboardingGoals?: string[];
  onboardingCompleted?: boolean;
  profileCompletion?: number;
  roleProfile?: RoleProfileData;
} => {
  const quick = payload.quickProfile;
  const goals = payload.goals ?? [];
  const roleProfile = mergeRoleProfile(payload.memberRole, goals, quick, payload.roleProfile ?? null);

  const shared: UpdateProfilePayload = {
    fullName: quick?.fullName?.trim() ?? "",
    headline: quick?.headline?.trim() ?? "",
    bio: "",
    role: payload.memberRole,
    location: quick?.location?.trim() ?? "",
    language: [],
    company: quick?.company?.trim() ?? "",
    website: quick?.website?.trim() ?? "",
    linkedinUrl: quick?.linkedinUrl?.trim() ?? "",
    skills: fromCsv(quick?.skills ?? ""),
    lookingFor: goals,
    openToConnect: true
  };

  if (payload.memberRole === "founder" && roleProfile.role === "founder") {
    shared.company = roleProfile.data.startupName || shared.company;
    shared.website = roleProfile.data.website || shared.website;
  }
  if (payload.memberRole === "investor" && roleProfile.role === "investor") {
    shared.company = roleProfile.data.fundName || shared.company;
  }
  if (payload.memberRole === "service_provider" && roleProfile.role === "service_provider") {
    shared.company = roleProfile.data.company || shared.company;
    shared.website = roleProfile.data.website || shared.website;
  }
  if (payload.memberRole === "professional" && roleProfile.role === "professional") {
    shared.skills = roleProfile.data.skills.length ? roleProfile.data.skills : shared.skills;
  }

  const draftProfile = {
    ...shared,
    id: "",
    avatarUrl: "",
    onboardingGoals: goals,
    roleProfile,
    createdAt: "",
    updatedAt: ""
  };

  return {
    ...shared,
    onboardingGoals: goals,
    roleProfile,
    profileCompletion: calculateProfileCompletion(draftProfile, payload.memberRole)
  };
};
