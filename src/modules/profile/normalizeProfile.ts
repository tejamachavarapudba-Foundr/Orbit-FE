import { OnboardingMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import {
  AdvisorProfile,
  emptyAdvisorProfile,
  emptyFounderProfile,
  emptyInvestorProfile,
  emptyProfessionalProfile,
  emptyServiceProviderProfile,
  FounderProfile,
  InvestorProfile,
  ProfessionalProfile,
  RoleProfileData,
  ServiceProviderProfile
} from "@/modules/profile/schemas";

type RawRecord = Record<string, unknown>;

const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const asStringArray = (value: unknown) => (Array.isArray(value) ? value.map((item) => String(item)) : []);

const normalizeFounderData = (raw: RawRecord = {}): FounderProfile => ({
  ...emptyFounderProfile(),
  startupName: asString(raw.startupName ?? raw.startup_name),
  startupStage: asString(raw.startupStage ?? raw.startup_stage),
  industry: asString(raw.industry),
  pitch: asString(raw.pitch),
  fundingNeeded: asString(raw.fundingNeeded ?? raw.funding_needed),
  teamSize: asString(raw.teamSize ?? raw.team_size),
  website: asString(raw.website),
  goals: asStringArray(raw.goals)
});

const normalizeInvestorData = (raw: RawRecord = {}): InvestorProfile => ({
  ...emptyInvestorProfile(),
  fundName: asString(raw.fundName ?? raw.fund_name),
  investmentRange: asString(raw.investmentRange ?? raw.investment_range),
  industries: asStringArray(raw.industries),
  portfolio: asString(raw.portfolio),
  geography: asString(raw.geography),
  goals: asStringArray(raw.goals)
});

const normalizeAdvisorData = (raw: RawRecord = {}): AdvisorProfile => ({
  ...emptyAdvisorProfile(),
  expertise: asStringArray(raw.expertise),
  yearsExperience: asString(raw.yearsExperience ?? raw.years_experience),
  industries: asStringArray(raw.industries),
  mentorshipAreas: asStringArray(raw.mentorshipAreas ?? raw.mentorship_areas),
  goals: asStringArray(raw.goals)
});

const normalizeProfessionalData = (raw: RawRecord = {}): ProfessionalProfile => ({
  ...emptyProfessionalProfile(),
  skills: asStringArray(raw.skills),
  experienceLevel: asString(raw.experienceLevel ?? raw.experience_level),
  portfolio: asString(raw.portfolio),
  resume: asString(raw.resume),
  goals: asStringArray(raw.goals)
});

const normalizeServiceProviderData = (raw: RawRecord = {}): ServiceProviderProfile => ({
  ...emptyServiceProviderProfile(),
  company: asString(raw.company),
  services: asStringArray(raw.services),
  website: asString(raw.website),
  clientIndustries: asStringArray(raw.clientIndustries ?? raw.client_industries),
  goals: asStringArray(raw.goals)
});

const normalizeRoleData = (role: OnboardingMemberRole, raw: RawRecord): RoleProfileData["data"] => {
  switch (role) {
    case "founder":
      return normalizeFounderData(raw);
    case "investor":
      return normalizeInvestorData(raw);
    case "advisor":
      return normalizeAdvisorData(raw);
    case "professional":
      return normalizeProfessionalData(raw);
    case "service_provider":
      return normalizeServiceProviderData(raw);
  }
};

const roleProfileFromNested = (raw: RawRecord): RoleProfileData | null => {
  const existing = raw.roleProfile as RawRecord | undefined;
  if (existing?.role && existing.data) {
    const role = String(existing.role) as OnboardingMemberRole;
    return { role, data: normalizeRoleData(role, existing.data as RawRecord) } as RoleProfileData;
  }

  const mappings: { keys: string[]; role: OnboardingMemberRole }[] = [
    { keys: ["founderProfile", "founder_profile"], role: "founder" },
    { keys: ["investorProfile", "investor_profile"], role: "investor" },
    { keys: ["advisorProfile", "advisor_profile"], role: "advisor" },
    { keys: ["professionalProfile", "professional_profile"], role: "professional" },
    { keys: ["serviceProviderProfile", "service_provider_profile"], role: "service_provider" }
  ];

  for (const mapping of mappings) {
    for (const key of mapping.keys) {
      const nested = raw[key] as RawRecord | undefined;
      if (nested && typeof nested === "object") {
        return { role: mapping.role, data: normalizeRoleData(mapping.role, nested) } as RoleProfileData;
      }
    }
  }

  return null;
};

/** Normalize API profile payloads (camelCase + snake_case + role tables) into AuthProfile. */
export const normalizeAuthProfile = (raw: AuthProfile & RawRecord): AuthProfile => {
  const roleProfile = roleProfileFromNested(raw);

  return {
    id: asString(raw.id),
    fullName: asString(raw.fullName ?? raw.full_name),
    headline: asString(raw.headline),
    bio: asString(raw.bio),
    role: asString(raw.role, "other"),
    location: asString(raw.location),
    company: asString(raw.company),
    website: asString(raw.website),
    linkedinUrl: asString(raw.linkedinUrl ?? raw.linkedin_url),
    skills: asStringArray(raw.skills),
    lookingFor: asStringArray(raw.lookingFor ?? raw.looking_for),
    openToConnect: typeof raw.openToConnect === "boolean" ? raw.openToConnect : raw.open_to_connect !== false,
    avatarUrl: asString(raw.avatarUrl ?? raw.avatar_url),
    onboardingCompleted: Boolean(raw.onboardingCompleted ?? raw.onboarding_completed),
    onboardingGoals: asStringArray(raw.onboardingGoals ?? raw.onboarding_goals),
    profileCompletion: Number(raw.profileCompletion ?? raw.profile_completion ?? 0),
    roleProfile,
    createdAt: asString(raw.createdAt ?? raw.created_at),
    updatedAt: asString(raw.updatedAt ?? raw.updated_at),
    // Resume metadata
    resumeKey: asString(
      raw.resumeKey ??
      raw.resume_key,
    ),

    resumeFileName: asString(
      raw.resumeFileName ??
      raw.resume_file_name,
    ),

    resumeFileSize: Number(
      raw.resumeFileSize ??
      raw.resume_file_size ??
      0,
    ),

    resumeUpdatedAt: asString(
      raw.resumeUpdatedAt ??
      raw.resume_updated_at,
    ),
  };
};
