/**
 * NestJS DTO reference — wire into ProfilesModule + new OnboardingController.
 * Endpoints:
 *   PATCH /profiles/me/onboarding
 *   POST  /profiles/me/onboarding/complete
 *   GET   /recommendations/matches
 */

export type OnboardingStep = "welcome" | "goals" | "quick_profile" | "matches";

export type SaveOnboardingDto = {
  step: OnboardingStep;
  memberRole: string;
  goals?: string[];
  quickProfile?: {
    fullName?: string;
    headline?: string;
    location?: string;
    linkedinUrl?: string;
    company?: string;
    website?: string;
    skills?: string[];
  };
  roleProfile?: Record<string, unknown>;
};

export type CompleteOnboardingDto = {
  memberRole: string;
  goals: string[];
  quickProfile: SaveOnboardingDto["quickProfile"];
  roleProfile: Record<string, unknown>;
};

export type MatchRecommendationsResponse = {
  total: number;
  breakdown: {
    investors: number;
    founders: number;
    advisors: number;
    professionals: number;
    serviceProviders: number;
  };
  people: Array<{
    id: string;
    fullName: string;
    headline: string;
    role: string;
    avatarUrl: string;
    matchScore: number;
    matchReasons: string[];
  }>;
  startups: Array<{
    id: string;
    name: string;
    stage: string;
    industry: string;
    matchScore: number;
  }>;
  opportunities: Array<{
    id: string;
    type: "job" | "event" | "project";
    title: string;
    matchScore: number;
  }>;
};
