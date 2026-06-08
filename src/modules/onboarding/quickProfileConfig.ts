import { OnboardingMemberRole } from "@/constants/memberRoles";

export type QuickFieldConfig = {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  mapsToShared?: "fullName" | "headline" | "location" | "linkedinUrl" | "company" | "website" | "skills";
};

export const QUICK_PROFILE_FIELDS: Record<OnboardingMemberRole, QuickFieldConfig[]> = {
  founder: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName", placeholder: "Your name" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline", placeholder: "Building the future of..." },
    { key: "startupName", label: "Startup Name", required: true, mapsToShared: "company", placeholder: "Acme Inc." },
    { key: "industry", label: "Industry", required: true, placeholder: "FinTech, HealthTech..." },
    { key: "startupStage", label: "Stage", required: true, placeholder: "Idea, MVP, Seed..." },
    { key: "location", label: "Location", required: true, mapsToShared: "location", placeholder: "San Francisco, CA" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url", placeholder: "https://linkedin.com/in/you" }
  ],
  investor: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "fundName", label: "Fund Name", required: true, mapsToShared: "company", placeholder: "Horizon Ventures" },
    { key: "investmentRange", label: "Investment Range", required: true, placeholder: "$100K – $2M" },
    { key: "industries", label: "Industries", required: true, placeholder: "AI, SaaS, Climate" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  advisor: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline", placeholder: "Product leader & startup advisor" },
    { key: "expertise", label: "Expertise", required: true, placeholder: "Product, GTM, Fundraising" },
    { key: "yearsExperience", label: "Years Experience", required: true, placeholder: "10+" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  professional: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline" },
    { key: "skills", label: "Skills", required: true, mapsToShared: "skills", placeholder: "React, Node.js, UX" },
    { key: "experienceLevel", label: "Experience Level", required: true, placeholder: "Junior, Mid, Senior" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  service_provider: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "company", label: "Company", required: true, mapsToShared: "company" },
    { key: "services", label: "Services Offered", required: true, placeholder: "Legal, Accounting, DevOps" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "website", label: "Website", required: true, mapsToShared: "website", keyboardType: "url" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ]
};

export const getQuickProfileValue = (
  fields: QuickFieldConfig[],
  quickProfile: { fullName: string; headline: string; location: string; linkedinUrl: string; company: string; website: string; skills: string; roleFields: Record<string, string> },
  key: string
) => {
  const field = fields.find((item) => item.key === key);
  if (field?.mapsToShared) {
    return quickProfile[field.mapsToShared];
  }
  return quickProfile.roleFields[key] ?? "";
};

export const isQuickProfileValid = (
  role: OnboardingMemberRole,
  quickProfile: Parameters<typeof getQuickProfileValue>[1]
) => {
  const fields = QUICK_PROFILE_FIELDS[role];

  if (!fields || !Array.isArray(fields)) {
    return false;
  }

  return fields.every((field) => {
    if (!field.required) {
      return true;
    }

    const value = getQuickProfileValue(
      fields,
      quickProfile,
      field.key
    );

    return Boolean(value?.trim?.());
  });
};
