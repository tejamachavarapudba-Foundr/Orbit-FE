import { Linking, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { useAuthStore } from "@/modules/auth/store";
import { normalizeMemberRole, ROLE_LABEL } from "@/constants/memberRoles";
import { useVerificationStatus } from "@/modules/verification/hooks";

const roleVerificationCopy: Record<string, string> = {
  founder: "Verify your startup's registration certificate",
  investor: "Add your company name and website",
  professional: "Add your experience and certifications",
  advisor: "Add your experience and certifications",
  service_provider: "Add your company details"
};

export const VerifyProfileScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const profile = useAuthStore((state) => state.user?.profile);
  const { status, isStartingIdentity, startIdentityVerification } = useVerificationStatus();

  const role = normalizeMemberRole(profile?.role);

  const roleVerified = role
    ? {
        founder: status?.founder?.status === "approved",
        investor: status?.investorVerified,
        professional: status?.professionalVerified,
        advisor: status?.advisorVerified,
        service_provider: status?.serviceProviderVerified
      }[role]
    : undefined;

  const roleSubtitle =
    role === "founder" && status?.founder?.status === "pending"
      ? "Under review"
      : role === "founder" && status?.founder?.status === "rejected"
        ? "Rejected — resubmit your certificate"
        : roleVerified
          ? "Completed"
          : (role && roleVerificationCopy[role]) || "";

  const handleIdentityPress = async () => {
    const url = await startIdentityVerification();
    if (url) {
      await Linking.openURL(url);
    }
  };

  return (
    <AppScreen>
      <View className="flex-row items-center gap-2 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          Verify profile
        </AppText>
      </View>

      <AppText tone="muted" size="sm" className="mt-1">
        Verified profiles are more trusted by other members.
      </AppText>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6 gap-3">
          <Pressable accessibilityRole="button" disabled={isStartingIdentity} onPress={() => void handleIdentityPress()}>
            <Card>
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Feather name="shield" size={20} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <AppText weight="semibold">Identity verification</AppText>
                  <AppText tone="muted" size="sm" className="mt-1">
                    {status?.identityVerified ? "Verified with DigiLocker" : "Verify with DigiLocker"}
                  </AppText>
                </View>
                {status?.identityVerified ? (
                  <Feather name="check-circle" size={iconSize.lg} color={colors.primary} />
                ) : (
                  <Feather name="chevron-right" size={18} color={colors.muted} />
                )}
              </CardContent>
            </Card>
          </Pressable>

          {/* Professional's experience + certifications are now edited
              directly in My Profile > Role details, with admin review
              happening automatically on save — there's nothing left to do
              from a separate verification screen for that role. */}
          {role && role !== "professional" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                role === "founder"
                  ? navigation.navigate("FounderVerification")
                  : navigation.navigate("RoleVerification", { role })
              }
            >
              <Card>
                <CardContent className="flex-row items-center gap-4 p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <Feather name="award" size={20} color={colors.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <AppText weight="semibold">{ROLE_LABEL[role]} verification</AppText>
                    <AppText tone="muted" size="sm" className="mt-1">
                      {roleSubtitle}
                    </AppText>
                  </View>
                  {roleVerified ? (
                    <Feather name="check-circle" size={iconSize.lg} color={colors.primary} />
                  ) : (
                    <Feather name="chevron-right" size={18} color={colors.muted} />
                  )}
                </CardContent>
              </Card>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
};
