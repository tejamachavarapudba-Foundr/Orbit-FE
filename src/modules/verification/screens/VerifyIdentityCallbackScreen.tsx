import { useEffect } from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { MainStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { useVerificationStatus } from "@/modules/verification/hooks";

type Props = NativeStackScreenProps<MainStackParamList, "VerifyIdentity">;

export const VerifyIdentityCallbackScreen = ({ navigation, route }: Props) => {
  const colors = useThemeTokens();
  const status = route.params?.status === "success" ? "success" : "error";
  const { loadStatus } = useVerificationStatus();

  useEffect(() => {
    if (status === "success") {
      void loadStatus();
    }
  }, [status, loadStatus]);

  return (
    <AppScreen>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        {status === "success" ? (
          <>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <Feather name="check" size={iconSize.xl} color={colors.success} />
            </View>
            <AppText weight="semibold" size="lg" className="text-center">
              Identity verified
            </AppText>
            <AppText tone="muted" size="sm" className="text-center">
              A verified badge now shows beside your name.
            </AppText>
          </>
        ) : (
          <>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-danger/15">
              <Feather name="x" size={iconSize.xl} color={colors.danger} />
            </View>
            <AppText weight="semibold" size="lg" className="text-center">
              Couldn't verify your identity
            </AppText>
            <AppText tone="muted" size="sm" className="text-center">
              Something went wrong with DigiLocker — please try again.
            </AppText>
          </>
        )}
        <AppButton label="Continue" onPress={() => navigation.navigate("VerifyProfile")} className="mt-2" />
      </View>
    </AppScreen>
  );
};
