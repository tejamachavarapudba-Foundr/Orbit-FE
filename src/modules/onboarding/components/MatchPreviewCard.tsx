import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { MatchRecommendations } from "@/modules/recommendations/types";

type MatchPreviewCardProps = {
  matches: MatchRecommendations;
};

export const MatchPreviewCard = ({ matches }: MatchPreviewCardProps) => (
  <View className="rounded-xl border border-border bg-surface p-4">
    <AppText size="lg" weight="bold">
      ✨ We found {matches.total} relevant people
    </AppText>
    <View className="mt-4 flex-row flex-wrap gap-3">
      <StatPill label="Investors" value={matches.breakdown.investors} />
      <StatPill label="Founders" value={matches.breakdown.founders} />
      <StatPill label="Advisors" value={matches.breakdown.advisors} />
      <StatPill label="Professionals" value={matches.breakdown.professionals} />
      <StatPill label="Service Providers" value={matches.breakdown.serviceProviders} />
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
