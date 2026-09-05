import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { themeColors } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => {
  const markSize = compact ? 40 : 48;
  const scheme = useThemeStore((state) => state.resolvedScheme);

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: markSize,
          height: markSize,
          borderRadius: markSize / 4,
          alignItems: "center",
          justifyContent: "center",
          // The icon artwork is designed against a dark backdrop — in light
          // theme it otherwise blends into the light surface behind it.
          backgroundColor: scheme === "light" ? themeColors.dark.background : "transparent"
        }}
      >
        <Image
          source={require("../../../assets/adaptive-icon.png")}
          style={{ width: markSize, height: markSize }}
          resizeMode="contain"
        />
      </View>
      {!compact ? (
        <AppText
          weight="medium"
          size="lg"
          style={{ fontFamily: "Orbitron_500Medium", letterSpacing: 2 }}
        >
          ORBIT
        </AppText>
      ) : null}
    </View>
  );
};
