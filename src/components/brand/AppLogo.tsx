import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeStore } from "@/store/themeStore";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => {
  const markSize = compact ? 40 : 48;
  const shadeSize = markSize * 1.15;
  const scheme = useThemeStore((state) => state.resolvedScheme);

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: shadeSize,
          height: shadeSize,
          borderRadius: shadeSize / 2,
          alignItems: "center",
          justifyContent: "center",
          // A soft round shade behind the ring artwork, not a solid button —
          // it's designed against a dark backdrop and otherwise blends into
          // a light theme's surface.
          backgroundColor: scheme === "light" ? "rgba(15, 18, 23, 0.5)" : "transparent"
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
