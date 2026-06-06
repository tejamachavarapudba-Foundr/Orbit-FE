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
  emoji: string;
  description: string;
}[] = [
  {
    value: "founder",
    label: "Founder",
    emoji: "👨‍💼",
    description: "Build and grow your startup"
  },
  {
    value: "investor",
    label: "Investor",
    emoji: "💰",
    description: "Discover promising startups"
  },
  {
    value: "advisor",
    label: "Advisor",
    emoji: "🎯",
    description: "Guide founders and teams"
  },
  {
    value: "professional",
    label: "Professional",
    emoji: "💻",
    description: "Find roles and opportunities"
  },
  {
    value: "service_provider",
    label: "Service Provider",
    emoji: "🏢",
    description: "Offer services to startups"
  }
];

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
  professional: "What brings you to Foundr?",
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
