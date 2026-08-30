import { Certification, WorkExperience } from "@/modules/profile/schemas/experience";

export type AdvisorProfile = {
  expertise: string[];
  expertiseOther: string;
  yearsExperience: string;
  industries: string[];
  mentorshipAreas: string[];
  mentorshipExperience: string;
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
  { label: "Leadership & Management", value: "leadership_management" },
  { label: "Other", value: "other" }
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

// Replaces the old 1-30 individual-year picker with brackets, same idea as
// Investor's Investment Experience field.
export const PROFESSIONAL_EXPERIENCE_OPTIONS = [
  { label: "0–2 years", value: "0_2" },
  { label: "3–5 years", value: "3_5" },
  { label: "6–10 years", value: "6_10" },
  { label: "11–15 years", value: "11_15" },
  { label: "16+ years", value: "16_plus" }
] as const;

export const MENTORSHIP_EXPERIENCE_OPTIONS = [
  { label: "No prior mentorship experience", value: "none" },
  { label: "Less than 2 years", value: "lt_2" },
  { label: "2–5 years", value: "2_5" },
  { label: "6–10 years", value: "6_10" },
  { label: "11+ years", value: "11_plus" }
] as const;

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
  expertiseOther: "",
  yearsExperience: "",
  industries: [],
  mentorshipAreas: [],
  mentorshipExperience: "",
  certifications: [],
  experiences: [],
  goals: []
});
