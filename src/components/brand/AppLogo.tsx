import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AppLogoProps = {
  compact?: boolean;
};

export const AppLogo = ({ compact = false }: AppLogoProps) => {
  const markSize = compact ? 32 : 36;

  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={require("../../../assets/adaptive-icon.png")}
        style={{ width: markSize, height: markSize }}
        resizeMode="contain"
      />
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
