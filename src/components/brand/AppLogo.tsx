import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { appConfig } from "@/constants/config";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => (
  <View className="flex-row items-center gap-3">
    <View className="h-12 w-12 items-center justify-center rounded-md bg-primary shadow-sm">
      <AppText tone="onPrimary" weight="bold" size="lg">
        S
      </AppText>
    </View>
    {!compact ? (
      <AppText weight="bold" size="xl">
        {appConfig.appName}
      </AppText>
    ) : null}
  </View>
);
