import { View } from "react-native";

import { OnboardingMemberRole } from "@/constants/memberRoles";
import { AppText } from "@/components/ui/AppText";
import { getCompletionBenefit, PROFILE_COMPLETION_BENEFITS } from "@/modules/profile/completion";

type ProfileCompletionBarProps = {
  percent: number;
  role?: OnboardingMemberRole | null;
  showBenefits?: boolean;
};

export const ProfileCompletionBar = ({ percent, role = null, showBenefits = true }: ProfileCompletionBarProps) => {
  const allBenefits = PROFILE_COMPLETION_BENEFITS[role ?? "founder"];
  const unlockedBenefits = showBenefits ? getCompletionBenefit(percent, role) : [];

  return (
    <View className="rounded-xl border border-border bg-surface-elevated p-4">
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
          {allBenefits.map((benefit) => {
            const unlocked = unlockedBenefits.includes(benefit);
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
