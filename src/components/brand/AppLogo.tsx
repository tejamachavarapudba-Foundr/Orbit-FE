import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeStore } from "@/store/themeStore";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => {
  const markSize = compact ? 40 : 48;
  // Ring is white/light against a light-theme header, easy to lose — a
  // solid dark disc just past its edge gives it contrast. Dark theme's own
  // background already does that job, so leave it untouched there.
  const shadowSize = markSize * 1.18;
  const isLight = useThemeStore((state) => state.resolvedScheme === "light");

  return (
    <View className="flex-row items-center gap-2">
      <View style={{ width: markSize, height: markSize, alignItems: "center", justifyContent: "center" }}>
        {isLight ? (
          <View
            style={{
              position: "absolute",
              width: shadowSize,
              height: shadowSize,
              borderRadius: shadowSize / 2,
              backgroundColor: "rgba(0,0,0,0.55)"
            }}
          />
        ) : null}
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
