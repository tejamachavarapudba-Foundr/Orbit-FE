import { Linking, Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

// TODO: replace with the real support inbox once one exists.
const SUPPORT_EMAIL = "support@startuphouze.com";

export const SupportScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();

  const emailSupport = () => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Orbit support")}`);
  };

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText family="display" size="2xl" weight="bold" className="mt-6">
          Support
        </AppText>
        <AppText tone="muted" size="sm" className="mt-2 leading-5">
          Stuck on something, or found a bug? We're happy to help.
        </AppText>

        <View className="mt-6 gap-3 rounded-md border border-border bg-surface p-4">
          <View className="flex-row items-center gap-3">
            <Feather name="mail" size={18} color={colors.primary} />
            <AppText weight="semibold">{SUPPORT_EMAIL}</AppText>
          </View>
          <AppButton label="Email support" onPress={emailSupport} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("FAQ")}
          className="mt-4 flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5"
        >
          <View>
            <AppText weight="semibold">Check the FAQ first</AppText>
            <AppText tone="muted" size="sm" className="mt-0.5">
              Common questions about matches, connections, and your account.
            </AppText>
          </View>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
};
