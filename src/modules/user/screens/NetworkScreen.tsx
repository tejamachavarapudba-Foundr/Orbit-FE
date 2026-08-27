import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader } from "@/components/layout/AppHeader";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { IncomingRequestsSection } from "@/modules/connections/components/IncomingRequestsSection";
import { useConnectionsStore } from "@/modules/connections/store";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { NetworkMemberRow } from "@/modules/follows/components/NetworkMemberRow";
import { useNetwork, useNetworkSuggestions } from "@/modules/follows/hooks";
import { FollowProfile, NetworkTab } from "@/modules/follows/types";
import { SuggestedProfile } from "@/modules/follows/suggestionEngine";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { useUserStore } from "@/modules/user/store";
import { getShadowStyle } from "@/theme/shadows";
import { lucideToFeather } from "@/theme/designTokens";

type NetworkTabOption = {
  label: string;
  value: NetworkTab;
  icon?: keyof typeof lucideToFeather;
  count?: number;
};

const NetworkTabBar = ({
  activeTab,
  followingCount,
  followersCount,
  onChange
}: {
  activeTab: NetworkTab;
  followingCount: number;
  followersCount: number;
  onChange: (tab: NetworkTab) => void;
}) => {
  const colors = useThemeTokens();

  const tabs = useMemo<NetworkTabOption[]>(
    () => [
      { label: "Invitations", value: "feed", icon: "Sparkles" },
      { label: "Following", value: "following", icon: "Users", count: followingCount },
      { label: "Followers", value: "followers", count: followersCount }
    ],
    [followersCount, followingCount]
  );

  return (
    <View className="flex-row rounded-full border border-border bg-background p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const iconName = tab.icon ? (lucideToFeather[tab.icon] as keyof typeof Feather.glyphMap) : null;
        const label = tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label;

        return (
          <Pressable
            key={tab.value}
            accessibilityRole="button"
            onPress={() => onChange(tab.value)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-2 py-2.5 ${
              isActive ? "bg-surface" : "bg-transparent"
            }`}
            style={isActive ? getShadowStyle("card") : undefined}
          >
            {iconName ? <Feather name={iconName} size={14} color={isActive ? colors.text : colors.muted} /> : null}
            <AppText
              tone={isActive ? "default" : "muted"}
              weight="semibold"
              size="xs"
              numberOfLines={1}
              className="text-center"
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const FeedView = ({
  suggestions,
  isLoadingSuggestions,
  onPressProfile
}: {
  suggestions: SuggestedProfile[];
  isLoadingSuggestions: boolean;
  onPressProfile: (userId: string) => void;
}) => {
  return (
    <View className="gap-3">
      <View>
        <AppText weight="bold" size="lg">
          Suggested for you
        </AppText>
        <AppText tone="muted" size="sm" className="mt-1">
          People you may know based on your role, location, and network.
        </AppText>
      </View>

      {isLoadingSuggestions && suggestions.length === 0 ? (
        <UserSkeletonList />
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="No suggestions right now"
          message="Check back after you follow more members or update your profile."
        />
      ) : (
        suggestions.map((profile) => (
          <NetworkMemberRow
            key={profile.id}
            profile={profile}
            onPress={onPressProfile}
            subtitle={
              profile.mutualCount > 0
                ? `${profile.mutualCount} mutual connection${profile.mutualCount > 1 ? "s" : ""} · ${profile.reason}`
                : profile.reason
            }
          />
        ))
      )}
    </View>
  );
};

export const NetworkScreen = () => {
  const openUserProfile = useOpenUserProfile();
  const [activeTab, setActiveTab] = useState<NetworkTab>("feed");
  const loadConnectedProfiles = useConnectionsStore((state) => state.loadConnectedProfiles);
  const refreshUsers = useUserStore((state) => state.refreshUsers);
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
  const { suggestions, isLoadingSuggestions } = useNetworkSuggestions();

  useEffect(() => {
    if (currentUserId) {
      void loadConnectedProfiles(currentUserId);
    }
  }, [currentUserId, loadConnectedProfiles]);

  const renderProfile = useCallback<ListRenderItem<FollowProfile>>(
    ({ item }) => <NetworkMemberRow profile={item} onPress={openUserProfile} />,
    [openUserProfile]
  );
  const keyExtractor = useCallback((item: FollowProfile) => item.id, []);

  const handleRefresh = useCallback(() => {
    void refresh();
    void refreshUsers();
  }, [refresh, refreshUsers]);

  const retry = useCallback(() => {
    if (currentUserId) {
      void loadNetwork(currentUserId);
    }
  }, [currentUserId, loadNetwork]);

  const listEmpty = useMemo(() => {
    if (activeTab === "feed") {
      return null;
    }

    if (isLoadingNetwork) {
      return <UserSkeletonList />;
    }

    if (networkErrorMessage) {
      return <ErrorState message={networkErrorMessage} onRetry={retry} />;
    }

    if (activeTab === "followers") {
      return <EmptyState title="No followers yet" message="As members discover you, they will appear here." />;
    }

    return (
      <View className="mt-2">
        <EmptyState title="You are not following anyone yet" message="Discover members and follow people you want in your network." />
        <AppButton label="Refresh network" variant="outline" onPress={() => void refresh()} className="mt-4" />
      </View>
    );
  }, [activeTab, isLoadingNetwork, networkErrorMessage, refresh, retry]);

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />

      <FlatList
        data={activeTab === "feed" ? [] : profiles}
        keyExtractor={keyExtractor}
        renderItem={renderProfile}
        refreshing={isRefreshingNetwork}
        onRefresh={handleRefresh}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="gap-5 pt-6">
            <NetworkTabBar
              activeTab={activeTab}
              followingCount={followingCount}
              followersCount={followersCount}
              onChange={setActiveTab}
            />

            <IncomingRequestsSection />

            {activeTab === "feed" ? (
              <FeedView
                suggestions={suggestions}
                isLoadingSuggestions={isLoadingSuggestions}
                onPressProfile={openUserProfile}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={listEmpty}
      />
    </AppScreen>
  );
};
