import { AuthProfile } from "@/modules/auth/types";
import { normalizeMemberRole, OnboardingMemberRole } from "@/constants/memberRoles";
import { FollowProfile } from "@/modules/follows/types";

export type SuggestedProfile = FollowProfile & {
  mutualCount: number;
  reason: string;
};

const ROLE_MATCH_TARGETS: Record<OnboardingMemberRole, OnboardingMemberRole[]> = {
  founder: ["investor", "advisor", "professional", "service_provider"],
  investor: ["founder", "advisor"],
  advisor: ["founder", "professional"],
  professional: ["founder", "investor", "advisor"],
  service_provider: ["founder", "investor"]
};

const normalise = (value: string) => value.trim().toLowerCase();

const sharedSkillCount = (left: string[], right: string[]) => {
  const rightSet = new Set(right.map(normalise));
  return left.filter((skill) => rightSet.has(normalise(skill))).length;
};

const countNetworkOverlap = (candidate: AuthProfile, network: FollowProfile[]) => {
  let overlap = 0;
  let anchorName = "";

  for (const member of network) {
    const sameCompany =
      candidate.company.trim() &&
      member.company.trim() &&
      normalise(candidate.company) === normalise(member.company);
    const sameLocation =
      candidate.location.trim() &&
      member.location.trim() &&
      normalise(candidate.location) === normalise(member.location);
    const skillOverlap = sharedSkillCount(candidate.skills, member.skills) > 0;

    if (sameCompany || sameLocation || skillOverlap) {
      overlap += 1;
      if (!anchorName) {
        anchorName = member.fullName || "someone in your network";
      }
    }
  }

  return { overlap, anchorName };
};

const scoreCandidate = (
  viewer: AuthProfile,
  candidate: AuthProfile,
  network: FollowProfile[]
): { score: number; mutualCount: number; reason: string } => {
  const viewerRole = normalizeMemberRole(viewer.role);
  const candidateRole = normalizeMemberRole(candidate.role);
  let score = 0;
  let reason = "Recommended for your network";

  if (viewerRole && candidateRole && ROLE_MATCH_TARGETS[viewerRole]?.includes(candidateRole)) {
    score += 30;
    reason = `Relevant ${candidateRole.replace("_", " ")} for your journey`;
  }

  const viewerGoals = [...(viewer.onboardingGoals ?? []), ...(viewer.lookingFor ?? [])];
  const candidateGoals = [...(candidate.onboardingGoals ?? []), ...(candidate.lookingFor ?? [])];
  const goalOverlap = viewerGoals.filter((goal) => candidateGoals.includes(goal));
  if (goalOverlap.length) {
    score += goalOverlap.length * 12;
    reason = `Shared interests: ${goalOverlap.slice(0, 2).join(", ")}`;
  }

  if (
    viewer.location.trim() &&
    candidate.location.trim() &&
    normalise(viewer.location) === normalise(candidate.location)
  ) {
    score += 15;
    reason = `Also based in ${candidate.location}`;
  }

  if (
    viewer.company.trim() &&
    candidate.company.trim() &&
    normalise(viewer.company) === normalise(candidate.company)
  ) {
    score += 20;
    reason = `Works at ${candidate.company}`;
  }

  const skillOverlap = sharedSkillCount(viewer.skills, candidate.skills);
  if (skillOverlap) {
    score += skillOverlap * 8;
    reason = `Shares ${skillOverlap} skill${skillOverlap > 1 ? "s" : ""} with you`;
  }

  const { overlap, anchorName } = countNetworkOverlap(candidate, network);
  if (overlap) {
    score += overlap * 18;
    reason =
      overlap === 1
        ? `${anchorName} may know this member`
        : `${overlap} people in your network may know this member`;
  }

  if (candidate.headline.trim()) {
    score += 5;
  }

  return { score, mutualCount: overlap, reason };
};

export const buildNetworkSuggestions = (
  viewer: AuthProfile | undefined,
  candidates: AuthProfile[],
  following: FollowProfile[],
  followers: FollowProfile[],
  connectedIds: Set<string>,
  limit = 8
): SuggestedProfile[] => {
  if (!viewer) {
    return [];
  }

  const excludedIds = new Set<string>([
    viewer.id,
    ...following.map((profile) => profile.id),
    ...followers.map((profile) => profile.id),
    ...connectedIds
  ]);

  const network = [...following, ...followers];

  return candidates
    .filter((candidate) => !excludedIds.has(candidate.id))
    .map((candidate) => {
      const { score, mutualCount, reason } = scoreCandidate(viewer, candidate, network);
      return { profile: candidate, score, mutualCount, reason };
    })
    .filter((item) => item.score >= 20)
    .sort((left, right) => right.score - left.score || right.mutualCount - left.mutualCount)
    .slice(0, limit)
    .map(({ profile, mutualCount, reason }) => ({
      ...profile,
      mutualCount,
      reason
    }));
};
