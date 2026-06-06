import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { getCompletionBenefit, PROFILE_COMPLETION_BENEFITS } from "@/modules/profile/completion";

type ProfileCompletionBarProps = {
  percent: number;
  showBenefits?: boolean;
};

export const ProfileCompletionBar = ({ percent, showBenefits = true }: ProfileCompletionBarProps) => {
  const benefits = showBenefits ? getCompletionBenefit(percent) : [];

  return (
    <View className="rounded-xl border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <AppText weight="bold">Profile completion</AppText>
        <AppText tone="primary" weight="bold">
          {percent}%
        </AppText>
      </View>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-background">
        <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percent)}%` }} />
      </View>
      {showBenefits ? (
        <View className="mt-4 gap-2">
          <AppText tone="muted" size="sm" weight="medium">
            Unlock benefits:
          </AppText>
          {PROFILE_COMPLETION_BENEFITS.map((benefit) => {
            const unlocked = benefits.includes(benefit);
            return (
              <AppText key={benefit} tone={unlocked ? "default" : "muted"} size="sm">
                {unlocked ? "✓" : "○"} {benefit}
              </AppText>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};
