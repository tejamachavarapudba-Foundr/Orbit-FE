import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

export const JobsTabScreen = () => {
  const colors = useThemeTokens();

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <View className="flex-1 px-4 pb-8 pt-4">
        <View className="w-full max-w-2xl self-center">
          <View className="mb-1 flex-row items-center gap-2">
            <Feather name="briefcase" size={iconSize.lg} color={colors.primary} />
            <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
              Jobs
            </AppText>
          </View>
          <AppText tone="muted" size="sm" className="mt-1 leading-5">
            Discover startup roles posted by founders on Foundr.
          </AppText>

          <Card className="mt-6">
            <CardContent className="items-center gap-3 px-6 py-12">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Feather name="briefcase" size={28} color={colors.primary} />
              </View>
              <AppText weight="semibold" size="lg" className="text-center">
                Jobs coming soon
              </AppText>
              <AppText tone="muted" size="sm" className="text-center leading-5">
                Browse roles, apply to openings, and manage applications. This module will connect when the jobs API is
                available on your backend.
              </AppText>
            </CardContent>
          </Card>
        </View>
      </View>
    </AppScreen>
  );
};
