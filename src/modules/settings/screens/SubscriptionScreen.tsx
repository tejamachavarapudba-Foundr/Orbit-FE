import { ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

const includedFeatures = [
  "Unlimited posts, comments, and connections",
  "Matches and recommendations",
  "Direct messaging",
  "Jobs and meetings"
];

export const SubscriptionScreen = () => {
  const colors = useThemeTokens();

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText family="display" size="2xl" weight="bold" className="mt-6">
          Subscription
        </AppText>

        <View className="mt-6 gap-2 rounded-md border border-border bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <AppText weight="bold" size="lg">
              Free plan
            </AppText>
            <View className="rounded-full bg-success/15 px-3 py-1">
              <AppText tone="success" size="xs" weight="semibold">
                Active
              </AppText>
            </View>
          </View>
          <AppText tone="muted" size="sm" className="leading-5">
            Startuphouze is currently free for everyone. Paid plans aren't available yet.
          </AppText>
        </View>

        <View className="mt-4 gap-3 rounded-md border border-border bg-surface p-4">
          <AppText weight="bold">What's included</AppText>
          {includedFeatures.map((feature) => (
            <View key={feature} className="flex-row items-center gap-3">
              <Feather name="check" size={16} color={colors.primary} />
              <AppText size="sm" className="flex-1">
                {feature}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
};
