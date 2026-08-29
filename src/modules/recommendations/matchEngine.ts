import { AuthProfile } from "@/modules/auth/types";
import { normalizeMemberRole, OnboardingMemberRole } from "@/constants/memberRoles";
import { MatchQuery, MatchRecommendations, MatchPerson } from "@/modules/recommendations/types";

const ROLE_MATCH_TARGETS: Record<OnboardingMemberRole, OnboardingMemberRole[]> = {
  founder: ["investor", "advisor", "professional", "service_provider"],
  investor: ["founder", "advisor"],
  advisor: ["founder", "professional"],
  professional: ["founder", "investor", "advisor"],
  service_provider: ["founder", "investor"]
};

const scoreProfile = (viewerRole: OnboardingMemberRole, goals: string[], profile: AuthProfile): { score: number; reasons: string[] } => {
  const targetRole = normalizeMemberRole(profile.role);
  if (!targetRole) {
    return { score: 0, reasons: [] };
  }

  const reasons: string[] = [];
  let score = 40;

  if (ROLE_MATCH_TARGETS[viewerRole]?.includes(targetRole)) {
    score += 25;
    reasons.push(`Relevant ${targetRole.replace("_", " ")} for your journey`);
  }

  const profileGoals = [...(profile.onboardingGoals ?? []), ...(profile.lookingFor ?? [])];
  const overlap = goals.filter((goal) => profileGoals.includes(goal));
  if (overlap.length) {
    score += overlap.length * 10;
    reasons.push(`Shared interests: ${overlap.slice(0, 2).join(", ")}`);
  }

  if (profile.headline?.trim()) {
    score += 5;
  }
  if (profile.location?.trim()) {
    score += 5;
    reasons.push("Same network region potential");
  }

  return { score: Math.min(100, score), reasons };
};

const toPerson = (profile: AuthProfile, score: number, reasons: string[]): MatchPerson => ({
  id: profile.id,
  fullName: profile.fullName,
  headline: profile.headline,
  role: profile.role,
  avatarUrl: profile.avatarUrl,
  matchScore: score,
  matchReasons: reasons
});

export const buildClientSideMatches = (profiles: AuthProfile[], query: MatchQuery): MatchRecommendations => {
  const viewerRole = normalizeMemberRole(query.memberRole);
  if (!viewerRole) {
    return {
      total: 0,
      breakdown: { investors: 0, founders: 0, advisors: 0, professionals: 0, serviceProviders: 0 },
      people: [],
      startups: [],
      opportunities: []
    };
  }

  // Base score for any profile with a recognizable role is 40 (see
  // scoreProfile) — a >=50 floor silently dropped every match that didn't
  // also have a role-match bonus, a shared goal, or both headline AND
  // location filled in, which is most sparse/test profiles. >=40 keeps any
  // profile with a valid role as at least a loose match instead of zero.
  const scored = profiles
    .map((profile) => {
      const { score, reasons } = scoreProfile(viewerRole, query.goals, profile);
      return { profile, score, reasons };
    })
    .filter((item) => item.score >= 40)
    .sort((a, b) => b.score - a.score);

  const people = scored.slice(0, 12).map((item) => toPerson(item.profile, item.score, item.reasons));

  const breakdown = {
    investors: scored.filter((item) => normalizeMemberRole(item.profile.role) === "investor").length,
    founders: scored.filter((item) => normalizeMemberRole(item.profile.role) === "founder").length,
    advisors: scored.filter((item) => normalizeMemberRole(item.profile.role) === "advisor").length,
    professionals: scored.filter((item) => normalizeMemberRole(item.profile.role) === "professional").length,
    serviceProviders: scored.filter((item) => normalizeMemberRole(item.profile.role) === "service_provider").length
  };

  const startups = scored
    .filter((item) => normalizeMemberRole(item.profile.role) === "founder" && item.profile.company?.trim())
    .slice(0, 6)
    .map((item) => ({
      id: item.profile.id,
      name: item.profile.company,
      stage: item.profile.roleProfile?.role === "founder" ? item.profile.roleProfile.data.startupStage : "",
      industry: item.profile.roleProfile?.role === "founder" ? item.profile.roleProfile.data.industry.join(", ") : "",
      matchScore: item.score
    }));

  return {
    total: scored.length,
    breakdown,
    people,
    startups,
    opportunities: []
  };
};
