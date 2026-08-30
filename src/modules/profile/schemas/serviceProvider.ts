export type ServiceProviderProfile = {
  company: string;
  services: string[];
  servicesOther: string;
  website: string;
  companyLinkedinUrl: string;
  clientIndustries: string[];
  goals: string[];
};

export const SERVICES_OFFERED_OPTIONS = [
  { label: "Legal & Compliance", value: "legal_compliance" },
  { label: "Accounting & Tax", value: "accounting_tax" },
  { label: "Business Consulting", value: "business_consulting" },
  { label: "Marketing & Branding", value: "marketing_branding" },
  { label: "Web & App Development", value: "web_app_development" },
  { label: "UI/UX & Design", value: "ui_ux_design" },
  { label: "Digital Marketing & SEO", value: "digital_marketing_seo" },
  { label: "Recruitment & HR", value: "recruitment_hr" },
  { label: "Financial & Fundraising Services", value: "financial_fundraising_services" },
  { label: "IT & Cloud Services", value: "it_cloud_services" },
  { label: "Other", value: "other" }
] as const;

export const CLIENT_INDUSTRIES_OPTIONS = [
  { label: "Technology & SaaS", value: "technology_saas" },
  { label: "FinTech", value: "fintech" },
  { label: "HealthTech", value: "healthtech" },
  { label: "EdTech", value: "edtech" },
  { label: "E-commerce & Retail", value: "ecommerce_retail" },
  { label: "AI & DeepTech", value: "ai_deeptech" },
  { label: "Consumer & D2C", value: "consumer_d2c" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Media & Entertainment", value: "media_entertainment" },
  { label: "Real Estate & Construction", value: "real_estate_construction" }
] as const;

export const SERVICE_PROVIDER_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "company", label: "Company", required: true },
  { key: "services", label: "Services Offered", required: true },
  { key: "location", label: "Location", required: true },
  { key: "website", label: "Website", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyServiceProviderProfile = (): ServiceProviderProfile => ({
  company: "",
  services: [],
  servicesOther: "",
  website: "",
  companyLinkedinUrl: "",
  clientIndustries: [],
  goals: []
});
