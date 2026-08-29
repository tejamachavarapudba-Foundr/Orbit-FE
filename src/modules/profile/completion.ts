import { OnboardingMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import { RoleProfileMap } from "@/modules/profile/schemas";

type CompletionField = {
  key: string;
  weight: number;
  isFilled: (profile: AuthProfile, roleProfile: RoleProfileMap[OnboardingMemberRole] | null) => boolean;
};

const hasText = (value: string | undefined | null) => Boolean(value?.trim());
const hasList = (value: unknown[] | undefined | null) => Boolean(value?.length);

const SHARED_FIELDS: CompletionField[] = [
  { key: "fullName", weight: 8, isFilled: (p) => hasText(p.fullName) },
  { key: "headline", weight: 8, isFilled: (p) => hasText(p.headline) },
  { key: "location", weight: 8, isFilled: (p) => hasText(p.location) },
  { key: "linkedinUrl", weight: 8, isFilled: (p) => hasText(p.linkedinUrl) },
  { key: "avatarUrl", weight: 6, isFilled: (p) => hasText(p.avatarUrl) },
  { key: "bio", weight: 6, isFilled: (p) => hasText(p.bio) },
  { key: "onboardingGoals", weight: 10, isFilled: (p) => hasList(p.onboardingGoals) }
];

// Weights reflect how much each field matters for that role's discovery
// (e.g. a founder's stage matters more than team size). Per the product
// note, founder & investor deliberately have no resume field — a resume
// isn't relevant to raising or investing — while professional, advisor and
// service_provider count the shared resume upload toward their %.
const ROLE_FIELDS: Record<OnboardingMemberRole, CompletionField[]> = {
  founder: [
    { key: "startupName", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["founder"])?.startupName) },
    { key: "founderStatus", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.founderStatus) },
    { key: "currentRole", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.currentRole) },
    { key: "startupStage", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.startupStage) },
    { key: "industry", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["founder"])?.industry) },
    { key: "teamSize", weight: 4, isFilled: (_, r) => hasText((r as RoleProfileMap["founder"])?.teamSize) },
    { key: "website", weight: 6, isFilled: (p, r) => hasText(p.website) || hasText((r as RoleProfileMap["founder"])?.website) },
    { key: "portfolio", weight: 4, isFilled: (_, r) => hasList((r as RoleProfileMap["founder"])?.portfolio) }
  ],
  investor: [
    { key: "fundName", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["investor"])?.fundName) },
    { key: "investingAs", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.investingAs) },
    { key: "investorType", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.investorType) },
    { key: "investmentRange", weight: 10, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.investmentRange) },
    { key: "investmentStage", weight: 6, isFilled: (_, r) => hasList((r as RoleProfileMap["investor"])?.investmentStage) },
    { key: "industries", weight: 10, isFilled: (_, r) => hasList((r as RoleProfileMap["investor"])?.industries) },
    { key: "yearsInvestingExperience", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["investor"])?.yearsInvestingExperience) },
    { key: "portfolio", weight: 6, isFilled: (_, r) => hasList((r as RoleProfileMap["investor"])?.portfolio) }
  ],
  advisor: [
    { key: "expertise", weight: 12, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.expertise) },
    { key: "yearsExperience", weight: 10, isFilled: (_, r) => hasText((r as RoleProfileMap["advisor"])?.yearsExperience) },
    { key: "mentorshipExperience", weight: 8, isFilled: (_, r) => hasText((r as RoleProfileMap["advisor"])?.mentorshipExperience) },
    { key: "industries", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.industries) },
    { key: "mentorshipAreas", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["advisor"])?.mentorshipAreas) },
    { key: "resume", weight: 6, isFilled: (p) => hasText(p.resumeKey) }
  ],
  professional: [
    { key: "skills", weight: 12, isFilled: (p, r) => hasList(p.skills) || hasList((r as RoleProfileMap["professional"])?.skills) },
    { key: "specialization", weight: 4, isFilled: (_, r) => hasText((r as RoleProfileMap["professional"])?.specialization) },
    {
      key: "experience",
      weight: 10,
      isFilled: (_, r) =>
        hasList((r as RoleProfileMap["professional"])?.experiencePeriods) ||
        hasText((r as RoleProfileMap["professional"])?.experienceLevel)
    },
    { key: "portfolio", weight: 6, isFilled: (_, r) => hasText((r as RoleProfileMap["professional"])?.portfolio) },
    { key: "resume", weight: 8, isFilled: (p, r) => hasText(p.resumeKey) || hasText((r as RoleProfileMap["professional"])?.resume) }
  ],
  service_provider: [
    { key: "company", weight: 10, isFilled: (p, r) => hasText(p.company) || hasText((r as RoleProfileMap["service_provider"])?.company) },
    { key: "services", weight: 12, isFilled: (_, r) => hasList((r as RoleProfileMap["service_provider"])?.services) },
    { key: "website", weight: 8, isFilled: (p, r) => hasText(p.website) || hasText((r as RoleProfileMap["service_provider"])?.website) },
    { key: "clientIndustries", weight: 8, isFilled: (_, r) => hasList((r as RoleProfileMap["service_provider"])?.clientIndustries) },
    { key: "companyLinkedinUrl", weight: 4, isFilled: (_, r) => hasText((r as RoleProfileMap["service_provider"])?.companyLinkedinUrl) },
    { key: "resume", weight: 6, isFilled: (p) => hasText(p.resumeKey) }
  ]
};

export const PROFILE_COMPLETION_BENEFITS: Record<OnboardingMemberRole, string[]> = {
  founder: [
    "Better visibility in search",
    "Investor match suggestions",
    "Advisor & mentor recommendations",
    "Talent discovery for your team",
    "Networking opportunities"
  ],
  investor: [
    "Better visibility in search",
    "Curated startup deal flow",
    "Founder introduction requests",
    "Co-investor networking",
    "Portfolio discovery tools"
  ],
  advisor: [
    "Better visibility in search",
    "Founder match suggestions",
    "Mentorship request alerts",
    "Industry networking",
    "Advisory opportunities"
  ],
  professional: [
    "Better visibility in search",
    "Job match suggestions",
    "Startup discovery",
    "Skill-based networking",
    "Direct recruiter outreach"
  ],
  service_provider: [
    "Better visibility in search",
    "Client lead suggestions",
    "Startup discovery",
    "Referral network access",
    "Featured service listings"
  ]
};

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

export const getCompletionBenefit = (percent: number, role: OnboardingMemberRole | null) => {
  const benefits = PROFILE_COMPLETION_BENEFITS[role ?? "founder"];
  if (percent >= 80) {
    return benefits;
  }
  if (percent >= 50) {
    return benefits.slice(0, 3);
  }
  return benefits.slice(0, 2);
};
