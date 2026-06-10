import { useCallback } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { UserCard } from "@/modules/user/components/UserCard";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { useDiscoverUsers, userRoleFilters } from "@/modules/user/hooks";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";
import { UserRole, UserSummary } from "@/modules/user/types";

export const DiscoverScreen = () => {
  const colors = useThemeTokens();
  const {
    users,
    totalCount,
    hasMore,
    filters,
    isLoading,
    isRefreshing,
    errorMessage,
    loadUsers,
    refreshUsers,
    setQuery,
    setRole,
    loadMore
  } = useDiscoverUsers();
  const openUserProfile = useOpenUserProfile();

  const renderUser = useCallback<ListRenderItem<UserSummary>>(
    ({ item }) => <UserCard user={item} onPress={openUserProfile} showFollowButton />,
    [openUserProfile]
  );

  const keyExtractor = useCallback((item: UserSummary) => item.id, []);

  const renderRoleChip = useCallback(
    (role: { label: string; value: UserRole }) => {
      const isActive = filters.role === role.value;

      return (
        <Pressable
          key={role.value}
          accessibilityRole="button"
          onPress={() => setRole(role.value)}
          className={`mr-2 rounded-md border px-4 py-2 ${
            isActive ? "border-primary bg-primary" : "border-border bg-surface"
          }`}
        >
          <AppText tone={isActive ? "onPrimary" : "muted"} size="sm" weight="medium">
            {role.label}
          </AppText>
        </Pressable>
      );
    },
    [filters.role, setRole]
  );

  return (
    <AppScreen withHorizontalPadding={false}>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderUser}
        refreshing={isRefreshing}
        onRefresh={() => void refreshUsers()}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="pb-2 pt-6">
            <AppText size="2xl" weight="bold">
              Discover the network
            </AppText>
            <AppText tone="muted" className="mt-2 leading-6">
              Search founders, engineers, mentors, investors and policy makers building the future.
            </AppText>

            <View className="mt-6 rounded-md border border-border bg-surface px-4 shadow-sm">
              <TextInput
                value={filters.query}
                onChangeText={setQuery}
                placeholder="Search by name, skill, company, location..."
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                className="h-12 text-base text-text"
              />
            </View>

            <FlatList
              data={userRoleFilters}
              horizontal
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => renderRoleChip(item)}
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            />

            {totalCount > 0 ? (
              <AppText tone="muted" size="sm" className="mt-4">
                Showing {users.length} of {totalCount} members
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <UserSkeletonList />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={() => void loadUsers()} />
          ) : (
            <EmptyState title="No members found" message="Try another search term or role filter." />
          )
        }
        ListFooterComponent={
          hasMore ? <AppButton label="Load more" variant="outline" onPress={loadMore} className="mt-2" /> : null
        }
      />
    </AppScreen>
  );
};
