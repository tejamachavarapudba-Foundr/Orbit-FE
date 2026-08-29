import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { OnboardingMemberRole } from "@/constants/memberRoles";
import { MatchRecommendations } from "@/modules/recommendations/types";

type MatchPreviewCardProps = {
  matches: MatchRecommendations;
  viewerRole?: OnboardingMemberRole | null;
};

// The backend excludes the viewer's own role from candidates entirely
// (a founder isn't matched with other founders), so that bucket is always
// 0 — not because there are no founders on the platform, just because
// they're not relevant matches for a founder. Showing "0" there read as
// broken rather than as "not applicable", so that tile is skipped instead.
const ROLE_PILLS: { role: OnboardingMemberRole; label: string; key: keyof MatchRecommendations["breakdown"] }[] = [
  { role: "investor", label: "Investors", key: "investors" },
  { role: "founder", label: "Founders", key: "founders" },
  { role: "advisor", label: "Advisors", key: "advisors" },
  { role: "professional", label: "Professionals", key: "professionals" },
  { role: "service_provider", label: "Service Providers", key: "serviceProviders" }
];

export const MatchPreviewCard = ({ matches, viewerRole = null }: MatchPreviewCardProps) => (
  <View className="rounded-xl border border-border bg-surface p-4">
    <AppText size="lg" weight="bold">
      ✨ We found {matches.total} relevant people
    </AppText>
    <View className="mt-4 flex-row flex-wrap gap-3">
      {ROLE_PILLS.filter((pill) => pill.role !== viewerRole).map((pill) => (
        <StatPill key={pill.key} label={pill.label} value={matches.breakdown[pill.key]} />
      ))}
    </View>
  </View>
);

const StatPill = ({ label, value }: { label: string; value: number }) => (
  <View className="rounded-md bg-primary/10 px-3 py-2">
    <AppText tone="primary" weight="bold">
      {value}
    </AppText>
    <AppText tone="muted" size="xs">
      {label}
    </AppText>
  </View>
);
