export type FounderProfile = {
  startupName: string;
  startupStage: string;
  industry: string[];
  pitch: string;
  fundingNeeded: string;
  teamSize: string;
  website: string;
  founderStatus: string;
  currentRole: string;
  goals: string[];
};

export const FOUNDER_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "startupName", label: "Startup Name", required: true, mapsTo: "company" },
  { key: "industry", label: "Industry", required: true },
  { key: "startupStage", label: "Stage", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const FOUNDER_STATUS_OPTIONS = [
  { label: "Founder", value: "founder" },
  { label: "Co-Founder", value: "co_founder" }
] as const;

export const CURRENT_ROLE_OPTIONS = [
  { label: "CEO", value: "ceo" },
  { label: "CTO", value: "cto" },
  { label: "COO", value: "coo" },
  { label: "CPO", value: "cpo" },
  { label: "CMO", value: "cmo" },
  { label: "CFO", value: "cfo" },
  { label: "Other", value: "other" }
] as const;

export const STARTUP_STAGE_OPTIONS = [
  { label: "Idea", value: "idea" },
  { label: "MVP", value: "mvp" },
  { label: "Pre-Seed", value: "pre_seed" },
  { label: "Seed", value: "seed" },
  { label: "Series A", value: "series_a" },
  { label: "Series B", value: "series_b" },
  { label: "Series C", value: "series_c" },
  { label: "Series D+", value: "series_d_plus" },
  { label: "Growth Stage", value: "growth_stage" }
] as const;

export const FOUNDER_INDUSTRY_OPTIONS = [
  { label: "Technology & SaaS", value: "technology_saas" },
  { label: "Artificial Intelligence & DeepTech", value: "ai_deeptech" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech & Healthcare", value: "healthtech_healthcare" },
  { label: "EdTech", value: "edtech" },
  { label: "E-commerce & Retail", value: "ecommerce_retail" },
  { label: "Consumer & D2C", value: "consumer_d2c" },
  { label: "Manufacturing & Industrial", value: "manufacturing_industrial" },
  { label: "Media & Entertainment", value: "media_entertainment" },
  { label: "Real Estate & Construction", value: "real_estate_construction" }
] as const;

export const emptyFounderProfile = (): FounderProfile => ({
  startupName: "",
  startupStage: "",
  industry: [],
  pitch: "",
  fundingNeeded: "",
  teamSize: "",
  website: "",
  founderStatus: "",
  currentRole: "",
  goals: []
});
