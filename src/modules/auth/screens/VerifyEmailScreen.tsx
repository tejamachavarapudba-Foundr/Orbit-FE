import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { MainStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { authApi } from "@/modules/auth/api";
import { toAppError } from "@/utils/errors";
import { iconSize } from "@/theme/designTokens";

type VerifyEmailScreenProps = NativeStackScreenProps<MainStackParamList, "VerifyEmail">;

export const VerifyEmailScreen = ({ navigation, route }: VerifyEmailScreenProps) => {
  const colors = useThemeTokens();
  const { token } = route.params;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    authApi
      .verifyEmail({ token })
      .then((response) => {
        setStatus("success");
        setMessage(response.message);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(toAppError(error).message);
      });
  }, [token]);

  return (
    <AppScreen>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        {status === "loading" ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText tone="muted">Confirming your email…</AppText>
          </>
        ) : status === "success" ? (
          <>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <Feather name="check" size={iconSize.xl} color={colors.success} />
            </View>
            <AppText weight="semibold" size="lg" className="text-center">
              Email confirmed
            </AppText>
            <AppText tone="muted" size="sm" className="text-center">
              {message}
            </AppText>
            <AppButton label="Continue" onPress={() => navigation.navigate("Tabs")} className="mt-2" />
          </>
        ) : (
          <>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-danger/15">
              <Feather name="x" size={iconSize.xl} color={colors.danger} />
            </View>
            <AppText weight="semibold" size="lg" className="text-center">
              Couldn't confirm this link
            </AppText>
            <AppText tone="muted" size="sm" className="text-center">
              {message}
            </AppText>
            <AppButton label="Continue" variant="outline" onPress={() => navigation.navigate("Tabs")} className="mt-2" />
          </>
        )}
      </View>
    </AppScreen>
  );
};
