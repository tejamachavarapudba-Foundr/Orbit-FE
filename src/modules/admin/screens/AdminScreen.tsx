import { useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, TextInput, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { AdminStatCard } from "@/modules/admin/components/AdminStatCard";
import { adminTabs, useAdminDashboard } from "@/modules/admin/hooks";

export const AdminScreen = () => {
  const colors = useThemeTokens();
  const [postId, setPostId] = useState("");
  const {
    activeTab,
    stats,
    users,
    isLoading,
    mutatingId,
    errorMessage,
    setActiveTab,
    loadDashboard,
    banUser,
    deletePost
  } = useAdminDashboard();

  const trimmedPostId = postId.trim();

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void loadDashboard()} />}
      >
        <View className="w-full max-w-4xl self-center pt-8">
          <AppText size="2xl" weight="bold">
            Admin
          </AppText>
          <AppText tone="muted" className="mt-2 leading-6">
            Monitor platform health, user access and post moderation.
          </AppText>

          <View className="mt-5 flex-row flex-wrap gap-2 rounded-md bg-border/40 p-1">
            {adminTabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  accessibilityRole="button"
                  onPress={() => setActiveTab(tab.value)}
                  className={`rounded-md px-4 py-2 ${isActive ? "bg-surface shadow-sm" : "bg-transparent"}`}
                >
                  <AppText tone={isActive ? "default" : "muted"} weight="medium">
                    {tab.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {isLoading ? (
            <View className="mt-8 gap-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </View>
          ) : errorMessage ? (
            <View className="mt-8">
              <ErrorState message={errorMessage} onRetry={() => void loadDashboard()} />
            </View>
          ) : activeTab === "overview" && stats ? (
            <View className="mt-6 gap-4">
              <View className="flex-row flex-wrap gap-3">
                <AdminStatCard label="Users" value={stats.overview.totalUsers} />
                <AdminStatCard label="Projects" value={stats.overview.totalProjects} />
              </View>
              <View className="flex-row flex-wrap gap-3">
                <AdminStatCard label="Messages" value={stats.overview.totalMessages} />
                <AdminStatCard label="Conversion" value={stats.overview.conversionRate} />
              </View>
              <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
                <AppText weight="bold">Projects by stage</AppText>
                <View className="mt-3 gap-2">
                  {stats.growthMetrics.projectsByStage.map((stage) => (
                    <View key={stage.stage} className="flex-row justify-between">
                      <AppText tone="muted">{stage.stage}</AppText>
                      <AppText weight="bold">{stage.count}</AppText>
                    </View>
                  ))}
                </View>
              </View>
              <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
                <AppText weight="bold">System status</AppText>
                <AppText tone={stats.systemStatus.databaseConnected ? "success" : "danger"} className="mt-2">
                  Database {stats.systemStatus.databaseConnected ? "connected" : "offline"}
                </AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  {stats.systemStatus.timestamp}
                </AppText>
              </View>
            </View>
          ) : activeTab === "users" ? (
            <View className="mt-6 gap-3">
              {users.map((user) => (
                <View key={user.id} className="rounded-md border border-border bg-surface p-4 shadow-sm">
                  <View className="flex-row items-start gap-3">
                    <View className="flex-1">
                      <AppText weight="bold" size="lg">
                        {user.profile.fullName || user.email}
                      </AppText>
                      <AppText tone="muted" size="sm" className="mt-1">
                        {user.email}
                      </AppText>
                      <AppText tone={user.isBanned ? "danger" : "success"} size="sm" className="mt-2">
                        {user.role} | {user.isBanned ? "Banned" : "Active"}
                      </AppText>
                    </View>
                    <AppButton
                      label={user.isBanned ? "Banned" : "Ban"}
                      variant="outline"
                      disabled={user.isBanned}
                      loading={mutatingId === user.id}
                      onPress={() =>
                        Alert.alert("Ban user", `Ban ${user.email}?`, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Ban", style: "destructive", onPress: () => void banUser(user.id, { reason: "spam" }) }
                        ])
                      }
                      className="h-10 px-4"
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : activeTab === "posts" ? (
            <View className="mt-6 rounded-md border border-border bg-surface p-4 shadow-sm">
              <AppText weight="bold" size="lg">
                Force-delete a post
              </AppText>
              <AppText tone="muted" size="sm" className="mt-2 leading-5">
                Enter the post ID from a moderation report or feed item.
              </AppText>
              <TextInput
                value={postId}
                onChangeText={setPostId}
                placeholder="Post ID"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                autoCapitalize="none"
                className="mt-4 h-12 rounded-md border border-border bg-background px-4 text-base text-text"
              />
              <AppButton
                label="Delete post"
                variant="outline"
                disabled={!trimmedPostId}
                loading={mutatingId === trimmedPostId}
                onPress={() =>
                  Alert.alert("Delete post", `Force-delete post ${trimmedPostId}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        void deletePost(trimmedPostId).then((success) => {
                          if (success) {
                            setPostId("");
                          }
                        });
                      }
                    }
                  ])
                }
                className="mt-4"
              />
            </View>
          ) : (
            <View className="mt-8">
              <EmptyState title="No admin data" message="Refresh the dashboard or check admin permissions." />
            </View>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
};
