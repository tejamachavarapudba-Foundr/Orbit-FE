export type InvestorProfile = {
  fundName: string;
  investmentRange: string;
  industries: string[];
  portfolio: string;
  geography: string;
  investorType: string;
  investmentStage: string[];
  yearsInvestingExperience: string;
  goals: string[];
};

export const INVESTOR_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "fundName", label: "Fund Name", required: true, mapsTo: "company" },
  { key: "investmentRange", label: "Investment Range", required: true },
  { key: "industries", label: "Industries", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const INVESTOR_TYPE_OPTIONS = [
  { label: "Angel Investor", value: "angel_investor" },
  { label: "Venture Capital (VC)", value: "vc" },
  { label: "Corporate Investor", value: "corporate_investor" },
  { label: "Private Equity (PE)", value: "pe" },
  { label: "Family Office", value: "family_office" },
  { label: "Angel Network", value: "angel_network" },
  { label: "Accelerator / Incubator", value: "accelerator_incubator" },
  { label: "Other", value: "other" }
] as const;

export const INVESTMENT_RANGE_OPTIONS = [
  { label: "Under ₹10L", value: "under_10l" },
  { label: "₹10L – ₹25L", value: "10l_25l" },
  { label: "₹25L – ₹50L", value: "25l_50l" },
  { label: "₹50L – ₹1Cr", value: "50l_1cr" },
  { label: "₹1Cr – ₹5Cr", value: "1cr_5cr" },
  { label: "₹5Cr – ₹10Cr", value: "5cr_10cr" },
  { label: "₹10Cr – ₹50Cr", value: "10cr_50cr" },
  { label: "₹50Cr+", value: "50cr_plus" }
] as const;

export const INDUSTRY_OPTIONS = [
  { label: "AI & Machine Learning", value: "ai_ml" },
  { label: "SaaS & Enterprise Software", value: "saas_enterprise" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech & Healthcare", value: "healthtech" },
  { label: "E-commerce & Retail", value: "ecommerce_retail" },
  { label: "Consumer & D2C", value: "consumer_d2c" },
  { label: "ClimateTech & CleanTech", value: "climatetech_cleantech" },
  { label: "DeepTech", value: "deeptech" },
  { label: "Cybersecurity", value: "cybersecurity" },
  { label: "Mobility & Transportation", value: "mobility_transportation" }
] as const;

export const INVESTMENT_STAGE_OPTIONS = [
  { label: "Pre-Seed", value: "pre_seed" },
  { label: "Seed", value: "seed" },
  { label: "Series A", value: "series_a" },
  { label: "Series B", value: "series_b" },
  { label: "Series C", value: "series_c" },
  { label: "Series D+", value: "series_d_plus" },
  { label: "Growth / Late Stage", value: "growth_late_stage" },
  { label: "Pre-IPO", value: "pre_ipo" }
] as const;

/** Maps to InvestorProfile.geography — that column existed but was never wired to any UI until this field. */
export const INVESTMENT_GEOGRAPHY_OPTIONS = [
  { label: "India", value: "india" },
  { label: "US", value: "us" },
  { label: "Global", value: "global" }
] as const;

export const YEARS_INVESTING_EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const year = i + 1;
  return { label: `${year} year${year > 1 ? "s" : ""}`, value: String(year) };
});

export const emptyInvestorProfile = (): InvestorProfile => ({
  fundName: "",
  investmentRange: "",
  industries: [],
  portfolio: "",
  geography: "",
  investorType: "",
  investmentStage: [],
  yearsInvestingExperience: "",
  goals: []
});
