import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useGoogleConnection } from "@/modules/meeting/hooks";
import { iconSize } from "@/theme/designTokens";

export const GoogleConnectGate = () => {
  const colors = useThemeTokens();
  const { connect } = useGoogleConnection();

  return (
    <Card className="mt-4 items-center gap-3 p-6">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-muted-bg">
        <Feather name="video" size={iconSize.lg} color={colors.primary} />
      </View>
      <AppText weight="semibold" size="lg" className="text-center">
        Connect Google Meet
      </AppText>
      <AppText tone="muted" size="sm" className="text-center leading-5">
        Meetings run on your own Google Meet — connect your account once so Orbit can generate the link and add it to your
        calendar automatically.
      </AppText>
      <AppButton label="Connect Google Meet" onPress={() => void connect()} className="mt-2 w-full" />
    </Card>
  );
};
