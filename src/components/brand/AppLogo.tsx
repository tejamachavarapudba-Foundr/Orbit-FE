import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { getShadowStyle } from "@/theme/shadows";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => {
  const colors = useThemeTokens();
  const markSize = compact ? 32 : 36;

  return (
    <View className="flex-row items-center gap-2">
      <View
        className="items-center justify-center rounded-lg bg-primary"
        style={[{ width: markSize, height: markSize }, getShadowStyle("glow")]}
      >
        <Feather name="star" size={compact ? 14 : 16} color={colors.onPrimary} />
      </View>
      {!compact ? (
        <AppText family="display" weight="bold" size="lg" className="tracking-tight">
          Foundr
        </AppText>
      ) : null}
    </View>
  );
};
