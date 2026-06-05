import { useCallback } from "react";
import { FlatList, ListRenderItem, TextInput, View } from "react-native";

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
import { jobRoleOptions, useJobs } from "@/modules/jobs/hooks";
import { Job } from "@/modules/jobs/types";

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

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={jobs}
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

            <TextInput
              value={filters.query}
              onChangeText={setQuery}
              placeholder="Search jobs, startups, skills..."
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              className="mt-5 h-11 rounded-md border border-input bg-background px-3 text-sm text-text"
            />

            <View className="mt-4 flex-row flex-wrap gap-2">
              {jobRoleOptions.map((role) => (
                <FilterChip
                  key={role}
                  label={role === "all" ? "All roles" : role}
                  isActive={filters.role === role}
                  activeTone="primary"
                  onPress={() => setRole(role)}
                />
              ))}
            </View>

            <View className="mt-4">
              <JobComposer />
            </View>

            <JobDetailPanel />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
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
  );
};
