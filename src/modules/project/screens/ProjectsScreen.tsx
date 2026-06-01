import { useCallback } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { ProjectComposer } from "@/modules/project/components/ProjectComposer";
import { ProjectDetailPanel } from "@/modules/project/components/ProjectDetailPanel";
import { projectStageOptions, projectTypeOptions, useProjectDetail, useProjects } from "@/modules/project/hooks";
import { Project } from "@/modules/project/types";

export const ProjectsScreen = () => {
  const colors = useThemeTokens();
  const {
    projects,
    trendingStartups,
    totalCount,
    filters,
    isLoading,
    isRefreshing,
    errorMessage,
    loadProjects,
    refreshProjects,
    setQuery,
    setStage,
    setProjectType
  } = useProjects();
  const { selectProject } = useProjectDetail();

  const renderProject = useCallback<ListRenderItem<Project>>(
    ({ item }) => (
      <View className="w-full max-w-3xl self-center">
        <ProjectCard project={item} onPress={(id) => void selectProject(id)} />
      </View>
    ),
    [selectProject]
  );

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshing={isRefreshing}
        onRefresh={() => void refreshProjects()}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="w-full max-w-3xl self-center pt-8">
            <View className="flex-row items-center gap-3">
              <AppText size="2xl" weight="bold">
                Projects
              </AppText>
            </View>
            <AppText tone="muted" className="mt-2 leading-6">
              Explore startups, join teams, and publish what you are building.
            </AppText>

            <View className="mt-6 rounded-md border border-border bg-surface px-4 shadow-sm">
              <TextInput
                value={filters.query}
                onChangeText={setQuery}
                placeholder="Search projects, tech stack, location..."
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                className="h-12 text-base text-text"
              />
            </View>

            <View className="mt-5 rounded-md bg-border/40 p-1">
              <View className="flex-row flex-wrap gap-2">
                {projectStageOptions.map((option) => {
                  const isActive = filters.stage === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => setStage(option.value)}
                      className={`rounded-md px-4 py-2 ${isActive ? "bg-surface shadow-sm" : "bg-transparent"}`}
                    >
                      <AppText tone={isActive ? "default" : "muted"} weight="medium">
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-3 flex-row flex-wrap gap-2">
              {projectTypeOptions.map((option) => {
                const isActive = filters.projectType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => setProjectType(option.value)}
                    className={`rounded-md border px-4 py-2 ${isActive ? "border-primary bg-primary" : "border-border bg-surface"}`}
                  >
                    <AppText tone={isActive ? "onPrimary" : "muted"} weight="medium">
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-6">
              <ProjectComposer />
            </View>

            <ProjectDetailPanel />

            {trendingStartups.length > 0 ? (
              <View className="mt-6">
                <AppText weight="bold" size="lg">
                  Trending startups
                </AppText>
                <FlatList
                  data={trendingStartups}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View className="mr-3 w-72">
                      <ProjectCard project={item} onPress={(id) => void selectProject(id)} />
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                />
              </View>
            ) : null}

            {totalCount > 0 ? (
              <AppText tone="muted" size="sm" className="mt-5">
                Showing {totalCount} projects
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="w-full max-w-3xl self-center">
              <UserSkeletonList />
            </View>
          ) : errorMessage ? (
            <View className="w-full max-w-3xl self-center">
              <ErrorState message={errorMessage} onRetry={() => void loadProjects()} />
            </View>
          ) : (
            <View className="w-full max-w-3xl self-center">
              <EmptyState title="No projects found" message="Try a different filter or create the first project." />
            </View>
          )
        }
      />
    </AppScreen>
  );
};
