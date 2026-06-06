export type MatchPerson = {
  id: string;
  fullName: string;
  headline: string;
  role: string;
  avatarUrl: string;
  matchScore: number;
  matchReasons: string[];
};

export type MatchStartup = {
  id: string;
  name: string;
  stage: string;
  industry: string;
  matchScore: number;
};

export type MatchOpportunity = {
  id: string;
  type: "job" | "event" | "project";
  title: string;
  matchScore: number;
};

export type MatchRecommendations = {
  total: number;
  breakdown: {
    investors: number;
    founders: number;
    advisors: number;
    professionals: number;
    serviceProviders: number;
  };
  people: MatchPerson[];
  startups: MatchStartup[];
  opportunities: MatchOpportunity[];
};

export type MatchQuery = {
  memberRole: string;
  goals: string[];
};
