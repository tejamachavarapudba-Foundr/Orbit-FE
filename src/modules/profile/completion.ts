import { OnboardingMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import { RoleProfileMap } from "@/modules/profile/schemas";

type CompletionField = {
  key: string;
  weight: number;
  isFilled: (profile: AuthProfile, roleProfile: RoleProfileMap[OnboardingMemberRole] | null) => boolean;
};

const hasText = (value: string | undefined | null) => Boolean(value?.trim());
const hasList = (value: string[] | undefined | null) => Boolean(value?.length);

const SHARED_FIELDS: CompletionField[] = [
  { key: "fullName", weight: 8, isFilled: (p) => hasText(p.fullName) },
  { key: "headline", weight: 8, isFilled: (p) => hasText(p.headline) },
  { key: "location", weight: 8, isFilled: (p) => hasText(p.location) },
  { key: "linkedinUrl", weight: 8, isFilled: (p) => hasText(p.linkedinUrl) },
  { key: "avatarUrl", weight: 6, isFilled: (p) => hasText(p.avatarUrl) },
  { key: "bio", weight: 6, isFilled: (p) => hasText(p.bio) },
  { key: "onboardingGoals", weight: 10, isFilled: (p) => hasList(p.onboardingGoals) }
];

const ROLE_FIELDS: Record<OnboardingMemberRole, CompletionField[]> = {
  founder: [
    { key: "startupName", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["founder"])?.startupName) },
    { key: "industry", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.industry) },
    { key: "startupStage", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.startupStage) },
    { key: "pitch", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.pitch) },
    { key: "fundingNeeded", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.fundingNeeded) },
    { key: "teamSize", weight: 4, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.teamSize) },
    { key: "website", weight: 6, isFilled: (p, r) => hasText(p.website) || hasText((r as RoleProfileMap["founder"])?.website) }
  ],
  investor: [
    { key: "fundName", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["investor"])?.fundName) },
    { key: "investmentRange", weight: 10, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.investmentRange) },
    { key: "industries", weight: 10, isFilled: (_, r) => hasList((r as RoleProfileMap["investor"])?.industries) },
    { key: "portfolio", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.portfolio) },
    { key: "geography", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.geography) }
  ],
  advisor: [
    { key: "expertise", weight: 12, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.expertise) },
    { key: "yearsExperience", weight: 10, isFilled: (_, r) => hasText((r as RoleProfileMap["advisor"])?.yearsExperience) },
    { key: "industries", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.industries) },
    { key: "mentorshipAreas", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.mentorshipAreas) }
  ],
  professional: [
    { key: "skills", weight: 12, isFilled: (p, r) => hasList(p.skills) || hasList((r as RoleProfileMap["professional"])?.skills) },
    { key: "experienceLevel", weight: 10, isFilled: (_, r) => hasText((r as RoleProfileMap["professional"])?.experienceLevel) },
    { key: "portfolio", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["professional"])?.portfolio) },
    { key: "resume", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["professional"])?.resume) }
  ],
  service_provider: [
    { key: "company", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["service_provider"])?.company) },
    { key: "services", weight: 12, isFilled: (_, r) => hasList((r as RoleProfileMap["service_provider"])?.services) },
    { key: "website", weight: 8, isFilled: (p, r) => hasText(p.website) || hasText((r as RoleProfileMap["service_provider"])?.website) },
    { key: "clientIndustries", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["service_provider"])?.clientIndustries) }
  ]
};

export const PROFILE_COMPLETION_BENEFITS = [
  "Better visibility in search",
  "Smarter founder recommendations",
  "Investor match suggestions",
  "Startup discovery",
  "Networking opportunities"
];

export const calculateProfileCompletion = (
  profile: AuthProfile | undefined,
  memberRole: OnboardingMemberRole | null
): number => {
  if (!profile || !memberRole) {
    return 0;
  }

  const roleProfile = profile.roleProfile?.role === memberRole ? profile.roleProfile.data : null;
  const fields = [...SHARED_FIELDS, ...ROLE_FIELDS[memberRole]];
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  const earnedWeight = fields.reduce((sum, field) => {
    return sum + (field.isFilled(profile, roleProfile) ? field.weight : 0);
  }, 0);

  return Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
};

export const getCompletionBenefit = (percent: number) => {
  if (percent >= 80) {
    return PROFILE_COMPLETION_BENEFITS;
  }
  if (percent >= 50) {
    return PROFILE_COMPLETION_BENEFITS.slice(0, 3);
  }
  return PROFILE_COMPLETION_BENEFITS.slice(0, 2);
};
