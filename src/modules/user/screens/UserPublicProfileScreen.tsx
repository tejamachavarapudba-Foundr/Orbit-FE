import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { MainStackParamList } from "@/app/navigation/types";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROLE_LABEL, normalizeMemberRole } from "@/constants/memberRoles";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { UserActivitySection } from "@/modules/user/components/UserActivitySection";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { ConnectionCountLabel } from "@/modules/connections/components/ConnectionCountLabel";
import { UserConnectActions } from "@/modules/user/components/UserConnectActions";
import { UserRoleDetails } from "@/modules/user/components/UserRoleDetails";
import { userApi } from "@/modules/user/api";
import { UserSummary } from "@/modules/user/types";

type Props = NativeStackScreenProps<MainStackParamList, "UserProfile">;

const Pill = ({ label }: { label: string }) => (
  <View className="rounded-full bg-primary/10 px-3 py-1.5">
    <AppText tone="primary" size="sm">
      {label}
    </AppText>
  </View>
);

const InfoRow = ({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) => {
  const colors = useThemeTokens();

  return (
    <View className="flex-row items-center gap-2">
      <Feather name={icon} size={14} color={colors.muted} />
      <AppText tone="muted" size="sm">
        {label}
      </AppText>
    </View>
  );
};

export const UserPublicProfileScreen = ({ navigation, route }: Props) => {
  const colors = useThemeTokens();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await userApi.getUserById(route.params.userId);
      setUser(result);
    } catch {
      setErrorMessage("Could not load this profile.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [route.params.userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const profile = user?.profile;
  const memberRole = profile ? normalizeMemberRole(profile.role) : null;
  const roleLabel = memberRole ? ROLE_LABEL[memberRole] : profile?.role;

  return (
    <AppScreen withHorizontalPadding={false}>
      <View className="border-b border-border bg-surface px-5 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} className="flex-row items-center gap-2 self-start">
          <Feather name="arrow-left" size={20} color={colors.text} />
          <AppText weight="medium">Back</AppText>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="gap-4 p-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-32 w-full rounded-md" />
        </View>
      ) : errorMessage ? (
        <View className="p-5">
          <ErrorState message={errorMessage} onRetry={() => void loadUser()} />
        </View>
      ) : profile ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="h-28 bg-primary/15" />
          <View className="px-5">
            <View className="-mt-12">
              <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} size={96} />
            </View>

            <View className="mt-4 flex-row flex-wrap items-center gap-2">
              <AppText size="2xl" weight="bold">
                {profile.fullName || "Startuphouze member"}
              </AppText>
              {profile.openToConnect ? (
                <View className="rounded-full bg-success/15 px-3 py-1">
                  <AppText tone="success" size="xs" weight="semibold">
                    Open to connect
                  </AppText>
                </View>
              ) : null}
            </View>

            <AppText tone="primary" weight="semibold" className="mt-1">
              {roleLabel}
            </AppText>
            <ConnectionCountLabel userId={profile.id} className="mt-1" />
            {profile.headline ? (
              <AppText tone="muted" className="mt-2 leading-6">
                {profile.headline}
              </AppText>
            ) : null}

            <View className="mt-4 gap-2">
              {profile.company ? <InfoRow icon="briefcase" label={profile.company} /> : null}
              {profile.location ? <InfoRow icon="map-pin" label={profile.location} /> : null}
            </View>

            <View className="mt-5">
              <UserConnectActions profile={profile} />
            </View>

            {profile.bio ? (
              <View className="mt-6 rounded-md border border-border bg-surface p-4">
                <AppText weight="bold">About</AppText>
                <AppText className="mt-3 leading-6">{profile.bio}</AppText>
              </View>
            ) : null}

            {profile.skills.length > 0 ? (
              <View className="mt-4 rounded-md border border-border bg-surface p-4">
                <AppText weight="bold">Skills</AppText>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Pill key={skill} label={skill} />
                  ))}
                </View>
              </View>
            ) : null}

            {profile.lookingFor.length > 0 ? (
              <View className="mt-4 rounded-md border border-border bg-surface p-4">
                <AppText weight="bold">Looking for</AppText>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {profile.lookingFor.map((item) => (
                    <Pill key={item} label={item} />
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mt-4">
              <UserRoleDetails profile={profile} />
            </View>

            {(profile.website || profile.linkedinUrl) && (
              <View className="mt-4 rounded-md border border-border bg-surface p-4">
                <AppText weight="bold">Links</AppText>
                <View className="mt-3 gap-3">
                  {profile.website ? (
                    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(profile.website)}>
                      <InfoRow icon="globe" label={profile.website} />
                    </Pressable>
                  ) : null}
                  {profile.linkedinUrl ? (
                    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(profile.linkedinUrl)}>
                      <InfoRow icon="linkedin" label="LinkedIn profile" />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}

            <View className="mt-4">
              <UserActivitySection userId={profile.id} />
            </View>
          </View>
        </ScrollView>
      ) : null}
    </AppScreen>
  );
};
