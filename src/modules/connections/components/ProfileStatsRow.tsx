import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useConnectionCount } from "@/modules/connections/hooks";
import { useFollowCounts } from "@/modules/follows/hooks";

type ProfileStatsRowProps = {
  userId: string;
  className?: string;
};

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <View className="items-center">
    <AppText weight="bold" size="lg">
      {value}
    </AppText>
    <AppText tone="muted" size="xs">
      {label}
    </AppText>
  </View>
);

export const ProfileStatsRow = ({ userId, className = "" }: ProfileStatsRowProps) => {
  const followCounts = useFollowCounts(userId);
  const connectedCount = useConnectionCount(userId);

  return (
    <View className={`flex-row gap-6 ${className}`}>
      <StatItem value={followCounts?.following ?? 0} label="Following" />
      <StatItem value={followCounts?.followers ?? 0} label="Followers" />
      <StatItem value={connectedCount ?? 0} label="Connected" />
    </View>
  );
};
