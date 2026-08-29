import { OnboardingMemberRole } from "@/constants/memberRoles";
import {
  EXPERTISE_OPTIONS,
  MENTORSHIP_EXPERIENCE_OPTIONS,
  PROFESSIONAL_EXPERIENCE_OPTIONS
} from "@/modules/profile/schemas/advisor";
import {
  CURRENT_ROLE_OPTIONS,
  FOUNDER_STATUS_OPTIONS,
  STARTUP_STAGE_OPTIONS
} from "@/modules/profile/schemas/founder";
import {
  INDUSTRY_OPTIONS,
  INVESTING_AS_OPTIONS,
  INVESTMENT_EXPERIENCE_OPTIONS,
  INVESTMENT_RANGE_OPTIONS,
  INVESTMENT_STAGE_OPTIONS,
  INVESTOR_TYPE_OPTIONS
} from "@/modules/profile/schemas/investor";
import { ENGINEER_SPECIALIZATIONS } from "@/modules/profile/schemas/professional";
import { SERVICES_OFFERED_OPTIONS } from "@/modules/profile/schemas/serviceProvider";

export type QuickFieldConfig = {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  mapsToShared?: "fullName" | "headline" | "location" | "linkedinUrl" | "company" | "website" | "skills";
  type?: "text" | "dropdown" | "multiSelect" | "bottomSheet" | "multiSelectBottomSheet" | "portfolioNames" | "experiencePeriods";
  options?: readonly { label: string; value: string }[];
  max?: number;
};

export const QUICK_PROFILE_FIELDS: Record<OnboardingMemberRole, QuickFieldConfig[]> = {
  founder: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName", placeholder: "Your name" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline", placeholder: "Building the future of..." },
    { key: "startupName", label: "Organization Name", required: true, mapsToShared: "company", placeholder: "Acme Inc." },
    { key: "founderStatus", label: "Founder Status", required: true, type: "bottomSheet", options: FOUNDER_STATUS_OPTIONS },
    { key: "currentRole", label: "Current Role", required: true, type: "bottomSheet", options: CURRENT_ROLE_OPTIONS },
    { key: "startupStage", label: "Startup Stage", required: true, type: "bottomSheet", options: STARTUP_STAGE_OPTIONS },
    { key: "portfolio", label: "Portfolio", required: false, type: "portfolioNames" },
    { key: "location", label: "Location", required: true, mapsToShared: "location", placeholder: "San Francisco, CA" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url", placeholder: "https://linkedin.com/in/you" }
  ],
  investor: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "fundName", label: "Company Name", required: true, mapsToShared: "company", placeholder: "Horizon Ventures" },
    { key: "investingAs", label: "Investing As", required: true, type: "bottomSheet", options: INVESTING_AS_OPTIONS },
    { key: "investorType", label: "Investor Type", required: true, type: "bottomSheet", options: INVESTOR_TYPE_OPTIONS },
    { key: "investmentRange", label: "Investment Range", required: true, type: "bottomSheet", options: INVESTMENT_RANGE_OPTIONS },
    {
      key: "investmentStage",
      label: "Investment Stage",
      required: true,
      type: "multiSelectBottomSheet",
      options: INVESTMENT_STAGE_OPTIONS
    },
    {
      key: "industries",
      label: "Industry",
      required: true,
      type: "multiSelectBottomSheet",
      options: INDUSTRY_OPTIONS,
      max: 5
    },
    {
      key: "yearsInvestingExperience",
      label: "Investment Experience",
      required: true,
      type: "bottomSheet",
      options: INVESTMENT_EXPERIENCE_OPTIONS
    },
    { key: "portfolio", label: "Portfolio", required: false, type: "portfolioNames" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  advisor: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline", placeholder: "Product leader & startup advisor" },
    {
      key: "expertise",
      label: "Expertise",
      required: true,
      type: "multiSelectBottomSheet",
      options: EXPERTISE_OPTIONS,
      max: 5
    },
    {
      key: "yearsExperience",
      label: "Professional Experience",
      required: true,
      type: "bottomSheet",
      options: PROFESSIONAL_EXPERIENCE_OPTIONS
    },
    {
      key: "mentorshipExperience",
      label: "Mentorship Experience",
      required: true,
      type: "bottomSheet",
      options: MENTORSHIP_EXPERIENCE_OPTIONS
    },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  professional: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline" },
    {
      key: "specialization",
      label: "Engineer specialization (if applicable)",
      required: false,
      type: "bottomSheet",
      options: ENGINEER_SPECIALIZATIONS
    },
    { key: "skills", label: "Skills", required: true, mapsToShared: "skills", placeholder: "React, Node.js, UX" },
    { key: "experiencePeriods", label: "Experience", required: false, type: "experiencePeriods" },
    { key: "location", label: "Location", required: true, mapsToShared: "location" },
    { key: "linkedinUrl", label: "LinkedIn", required: true, mapsToShared: "linkedinUrl", keyboardType: "url" }
  ],
  service_provider: [
    { key: "fullName", label: "Name", required: true, mapsToShared: "fullName" },
    { key: "headline", label: "Headline", required: true, mapsToShared: "headline", placeholder: "Helping startups with legal, accounting, and more" },
    { key: "company", label: "Company", required: true, mapsToShared: "company" },
    {
      key: "services",
      label: "Services Offered",
      required: true,
      type: "multiSelectBottomSheet",
      options: SERVICES_OFFERED_OPTIONS,
      max: 5
    },
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
