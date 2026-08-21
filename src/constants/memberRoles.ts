import { ComponentProps } from "react";
import { Feather } from "@expo/vector-icons";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

/** Primary onboarding roles — maps 1:1 to `member_role` enum after migration. */
export type OnboardingMemberRole =
  | "founder"
  | "investor"
  | "advisor"
  | "professional"
  | "service_provider";

export type OnboardingGoal = string;

export const ONBOARDING_ROLES: {
  value: OnboardingMemberRole;
  label: string;
  icon: FeatherIconName;
  description: string;
}[] = [
  {
    value: "founder",
    label: "Founder",
    icon: "zap",
    description: "Build and grow your startup"
  },
  {
    value: "investor",
    label: "Investor",
    icon: "trending-up",
    description: "Discover promising startups"
  },
  {
    value: "advisor",
    label: "Advisor",
    icon: "target",
    description: "Guide founders and teams"
  },
  {
    value: "professional",
    label: "Professional",
    icon: "briefcase",
    description: "Find roles and opportunities"
  },
  {
    value: "service_provider",
    label: "Service Provider",
    icon: "tool",
    description: "Offer services to startups"
  }
];

export const ROLE_ACCENT_COLORS: Record<OnboardingMemberRole, { light: { bg: string; icon: string }; dark: { bg: string; icon: string } }> = {
  founder: { light: { bg: "#FAECE7", icon: "#712B13" }, dark: { bg: "#712B13", icon: "#F5C4B3" } },
  investor: { light: { bg: "#FAEEDA", icon: "#633806" }, dark: { bg: "#633806", icon: "#FAC775" } },
  advisor: { light: { bg: "#EEEDFE", icon: "#3C3489" }, dark: { bg: "#3C3489", icon: "#CECBF6" } },
  professional: { light: { bg: "#E6F1FB", icon: "#0C447C" }, dark: { bg: "#0C447C", icon: "#B5D4F4" } },
  service_provider: { light: { bg: "#E1F5EE", icon: "#085041" }, dark: { bg: "#085041", icon: "#9FE1CB" } }
};

export const ROLE_GOALS: Record<OnboardingMemberRole, { label: string; value: string }[]> = {
  founder: [
    { label: "Co-Founder", value: "co_founder" },
    { label: "CTO", value: "cto" },
    { label: "Developer", value: "developer" },
    { label: "Designer", value: "designer" },
    { label: "Advisor", value: "advisor" },
    { label: "Investor", value: "investor" },
    { label: "Customers", value: "customers" },
    { label: "Partnerships", value: "partnerships" }
  ],
  investor: [
    { label: "Startups", value: "startups" },
    { label: "Founders", value: "founders" },
    { label: "AI Companies", value: "ai_companies" },
    { label: "SaaS Companies", value: "saas_companies" },
    { label: "Revenue Generating Startups", value: "revenue_startups" },
    { label: "Early Stage Startups", value: "early_stage" }
  ],
  advisor: [
    { label: "Product", value: "product" },
    { label: "Technology", value: "technology" },
    { label: "Marketing", value: "marketing" },
    { label: "Fundraising", value: "fundraising" },
    { label: "Sales", value: "sales" }
  ],
  professional: [
    { label: "Jobs", value: "jobs" },
    { label: "Networking", value: "networking" },
    { label: "Mentorship", value: "mentorship" },
    { label: "Freelance Work", value: "freelance" },
    { label: "Startup Opportunities", value: "startup_opportunities" }
  ],
  service_provider: [
    { label: "Startup Clients", value: "startup_clients" },
    { label: "Founder Connections", value: "founder_connections" },
    { label: "Investor Network", value: "investor_network" },
    { label: "Consulting Opportunities", value: "consulting" }
  ]
};

export const ROLE_GOAL_TITLES: Record<OnboardingMemberRole, string> = {
  founder: "What are you looking for?",
  investor: "What do you want to discover?",
  advisor: "I want to help with:",
  professional: "What brings you to Startuphouze?",
  service_provider: "What are you looking for?"
};

export const ROLE_LABEL: Record<OnboardingMemberRole, string> = ONBOARDING_ROLES.reduce(
  (acc, role) => ({ ...acc, [role.value]: role.label }),
  {} as Record<OnboardingMemberRole, string>
);

/** Legacy DB roles still supported in discovery filters. */
export const LEGACY_ROLE_ALIASES: Record<string, OnboardingMemberRole | string> = {
  co_founder: "founder",
  software_engineer: "professional",
  mentor: "advisor",
  designer: "professional",
  product_manager: "professional",
  policy_maker: "advisor",
  other: "professional"
};

export const normalizeMemberRole = (role: string | undefined): OnboardingMemberRole | null => {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const onboardingRole = ONBOARDING_ROLES.find((item) => item.value === normalized);
  if (onboardingRole) {
    return onboardingRole.value;
  }

  const alias = LEGACY_ROLE_ALIASES[normalized];
  if (alias && ONBOARDING_ROLES.some((item) => item.value === alias)) {
    return alias as OnboardingMemberRole;
  }

  return null;
};
