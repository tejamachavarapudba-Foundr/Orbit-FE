import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConnectButton } from "@/modules/connections/components/ConnectButton";
import { ConnectionCountLabel } from "@/modules/connections/components/ConnectionCountLabel";
import { IncomingRequestsSection } from "@/modules/connections/components/IncomingRequestsSection";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useNetwork } from "@/modules/follows/hooks";
import { FollowProfile, NetworkTab } from "@/modules/follows/types";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";

const tabLabels: { label: string; value: NetworkTab }[] = [
  { label: "Followers", value: "followers" },
  { label: "Following", value: "following" }
];

const ProfileRow = ({ profile, onPress }: { profile: FollowProfile; onPress: (userId: string) => void }) => {
  const colors = useThemeTokens();
  const headline = profile.headline.trim() || profile.role || "Foundr member";
  const detail = [profile.company, profile.location].filter(Boolean).join(" | ");

  return (
    <View className="rounded-md border border-border bg-surface p-4">
      <Pressable accessibilityRole="button" onPress={() => onPress(profile.id)}>
        <View className="flex-row gap-3">
          <UserAvatar name={profile.fullName} imageUrl={profile.avatarUrl} />
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-2">
              <AppText weight="bold" size="lg" className="flex-1">
                {profile.fullName || "Foundr member"}
              </AppText>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </View>
            <AppText tone="primary" size="sm" weight="medium" className="mt-1">
              {headline}
            </AppText>
            <ConnectionCountLabel userId={profile.id} className="mt-1" />
            {detail ? (
              <AppText tone="muted" size="sm" className="mt-2">
                {detail}
              </AppText>
            ) : null}
            {profile.skills.length > 0 ? (
              <View className="mt-3 self-start rounded-md bg-primary/10 px-3 py-2">
                <AppText tone="primary" size="sm">
                  {profile.skills[0]}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
      <ConnectButton profile={profile} compact />
    </View>
  );
};

export const NetworkScreen = () => {
  const openUserProfile = useOpenUserProfile();
  const [activeTab, setActiveTab] = useState<NetworkTab>("followers");
  const {
    currentUserId,
    profiles,
    followersCount,
    followingCount,
    isLoadingNetwork,
    isRefreshingNetwork,
    networkErrorMessage,
    loadNetwork,
    refresh
  } = useNetwork(activeTab);

  const renderProfile = useCallback<ListRenderItem<FollowProfile>>(
    ({ item }) => <ProfileRow profile={item} onPress={openUserProfile} />,
    [openUserProfile]
  );
  const keyExtractor = useCallback((item: FollowProfile) => item.id, []);

  const retry = useCallback(() => {
    if (currentUserId) {
      void loadNetwork(currentUserId);
    }
  }, [currentUserId, loadNetwork]);

  return (
    <AppScreen withHorizontalPadding={false}>
      <FlatList
        data={profiles}
        keyExtractor={keyExtractor}
        renderItem={renderProfile}
        refreshing={isRefreshingNetwork}
        onRefresh={() => void refresh()}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="pt-6">
            <AppText size="2xl" weight="bold">
              Your network
            </AppText>
            <AppText tone="muted" className="mt-2 leading-6">
              Track people following you and the members you follow on Startuphouze.
            </AppText>

            <View className="mt-6 flex-row gap-3">
              <View className="flex-1 rounded-md border border-border bg-surface p-4">
                <AppText tone="muted" size="sm">
                  Followers
                </AppText>
                <AppText size="2xl" weight="bold" className="mt-1">
                  {followersCount}
                </AppText>
              </View>
              <View className="flex-1 rounded-md border border-border bg-surface p-4">
                <AppText tone="muted" size="sm">
                  Following
                </AppText>
                <AppText size="2xl" weight="bold" className="mt-1">
                  {followingCount}
                </AppText>
              </View>
            </View>

            <IncomingRequestsSection />

            <View className="mt-5 flex-row rounded-md border border-border bg-surface p-1">
              {tabLabels.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <Pressable
                    key={tab.value}
                    accessibilityRole="button"
                    onPress={() => setActiveTab(tab.value)}
                    className={`flex-1 rounded-md px-4 py-3 ${isActive ? "bg-primary" : "bg-transparent"}`}
                  >
                    <AppText tone={isActive ? "onPrimary" : "muted"} weight="semibold" className="text-center">
                      {tab.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoadingNetwork ? (
            <UserSkeletonList />
          ) : networkErrorMessage ? (
            <ErrorState message={networkErrorMessage} onRetry={retry} />
          ) : activeTab === "followers" ? (
            <EmptyState title="No followers yet" message="As members discover you, they will appear here." />
          ) : (
            <View className="mt-2">
              <EmptyState title="You are not following anyone yet" message="Discover members and follow people you want in your network." />
              <AppButton label="Refresh network" variant="outline" onPress={() => void refresh()} className="mt-4" />
            </View>
          )
        }
      />
    </AppScreen>
  );
};
