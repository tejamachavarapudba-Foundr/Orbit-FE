import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/modules/auth/store";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { JobCard } from "@/modules/jobs/components/JobCard";
import { JobComposer } from "@/modules/jobs/components/JobComposer";
import { JobDetailPanel } from "@/modules/jobs/components/JobDetailPanel";
import { JobFilterModal } from "@/modules/jobs/components/JobFilterModal";
import { MyApplicationsPanel, MyPostsAnalyticsPanel } from "@/modules/jobs/components/MyJobsPanel";
import { useJobs } from "@/modules/jobs/hooks";
import { Job } from "@/modules/jobs/types";
import { iconSize } from "@/theme/designTokens";

type JobsTab = "browse" | "mine";

export const JobsScreen = () => {
  const colors = useThemeTokens();
  const {
    jobs,
    totalCount,
    filters,
    isLoading,
    isRefreshing,
    errorMessage,
    loadJobs,
    refreshJobs,
    setQuery,
    setRole,
    selectJob
  } = useJobs();

  const renderJob = useCallback<ListRenderItem<Job>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <JobCard job={item} onPress={(id) => void selectJob(id)} />
      </View>
    ),
    [selectJob]
  );
  const profile = useAuthStore(
    (state) => state.user?.profile,
  );
  
  const canPostJobs =
    profile?.role === "founder" ||
    profile?.role === "co_founder" ||
    profile?.role === "investor" ||
    profile?.role === "hr";

  const [activeTab, setActiveTab] = useState<JobsTab>("browse");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const hasActiveFilters = filters.role !== "all";

  return (
    <>
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={activeTab === "browse" ? jobs : []}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        refreshing={isRefreshing}
        onRefresh={() => void refreshJobs()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="w-full max-w-2xl self-center pb-2 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                  Jobs
                </AppText>
                <AppText tone="muted" size="sm" className="mt-2 leading-5">
                  Browse startup roles, apply with a short note, and manage applications from one place.
                </AppText>
              </View>
              <AppText tone="muted" size="sm" className="mt-1">
                {totalCount} openings
              </AppText>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <FilterChip
                label="New jobs"
                isActive={activeTab === "browse"}
                activeTone="primary"
                onPress={() => setActiveTab("browse")}
              />
              <FilterChip
                label={canPostJobs ? "My posts | Analytics" : "Applied | Status"}
                isActive={activeTab === "mine"}
                activeTone="primary"
                onPress={() => setActiveTab("mine")}
              />
            </View>

            {activeTab === "browse" ? (
              <>
                <View className="mt-5 flex-row items-center gap-2">
                  <TextInput
                    value={filters.query}
                    onChangeText={setQuery}
                    placeholder="Search jobs, startups, skills..."
                    placeholderTextColor={colors.muted}
                    selectionColor={colors.primary}
                    className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm text-text"
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Filter & sort"
                    onPress={() => setFilterModalVisible(true)}
                    className="relative h-11 w-11 items-center justify-center rounded-md border border-input bg-background"
                  >
                    <Feather name="sliders" size={iconSize.md} color={colors.text} />
                    {hasActiveFilters ? (
                      <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                    ) : null}
                  </Pressable>
                </View>
                {canPostJobs && (
                  <View className="mt-4">
                    <JobComposer />
                  </View>
                )}
                <JobDetailPanel />
              </>
            ) : canPostJobs ? (
              <MyPostsAnalyticsPanel visible={activeTab === "mine"} />
            ) : (
              <MyApplicationsPanel visible={activeTab === "mine"} />
            )}
          </View>
        }
        ListEmptyComponent={
          activeTab === "mine" ? null : isLoading ? (
            <View className="w-full max-w-2xl gap-3 self-center">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </View>
          ) : errorMessage ? (
            <View className="w-full max-w-2xl self-center">
              <ErrorState message={errorMessage} onRetry={() => void loadJobs()} />
            </View>
          ) : (
            <View className="w-full max-w-2xl self-center">
              <EmptyState title="No jobs found" message="Try a different search or post the first startup role." />
            </View>
          )
        }
      />
    </AppScreen>
    <JobFilterModal
      visible={filterModalVisible}
      onClose={() => setFilterModalVisible(false)}
      role={filters.role}
      onSetRole={setRole}
    />
    </>
  );
};
