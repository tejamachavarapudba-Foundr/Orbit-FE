import { Certification, WorkExperience } from "@/modules/profile/schemas/experience";

export type AdvisorProfile = {
  expertise: string[];
  yearsExperience: string;
  industries: string[];
  mentorshipAreas: string[];
  certifications: Certification[];
  experiences: WorkExperience[];
  goals: string[];
};

export const EXPERTISE_OPTIONS = [
  { label: "Business Strategy", value: "business_strategy" },
  { label: "Product Management", value: "product_management" },
  { label: "Technology & Engineering", value: "technology_engineering" },
  { label: "Sales & Business Development", value: "sales_business_development" },
  { label: "Marketing & Branding", value: "marketing_branding" },
  { label: "Growth", value: "growth" },
  { label: "Fundraising", value: "fundraising" },
  { label: "Finance", value: "finance" },
  { label: "Operations", value: "operations" },
  { label: "Leadership & Management", value: "leadership_management" }
] as const;

export const MENTORSHIP_AREAS_OPTIONS = [
  { label: "Idea Validation", value: "idea_validation" },
  { label: "MVP Development", value: "mvp_development" },
  { label: "Product-Market Fit", value: "product_market_fit" },
  { label: "Business Strategy", value: "business_strategy" },
  { label: "Go-to-Market", value: "go_to_market" },
  { label: "Customer Acquisition", value: "customer_acquisition" },
  { label: "Sales & Revenue", value: "sales_revenue" },
  { label: "Fundraising & Pitching", value: "fundraising_pitching" },
  { label: "Hiring & Team Building", value: "hiring_team_building" },
  { label: "Startup Scaling", value: "startup_scaling" }
] as const;

export const YEARS_OF_EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const year = i + 1;
  return { label: `${year} year${year > 1 ? "s" : ""}`, value: String(year) };
});

/** Maps to AdvisorProfile.industries — same column the old free-text "Industries" field used. */
export const INDUSTRY_EXPERIENCE_OPTIONS = [
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

export const ADVISOR_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "expertise", label: "Expertise", required: true },
  { key: "yearsExperience", label: "Years Experience", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyAdvisorProfile = (): AdvisorProfile => ({
  expertise: [],
  yearsExperience: "",
  industries: [],
  mentorshipAreas: [],
  certifications: [],
  experiences: [],
  goals: []
});
