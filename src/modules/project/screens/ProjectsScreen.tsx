import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { ProjectComposer } from "@/modules/project/components/ProjectComposer";
import { StartupBrowseSection } from "@/modules/project/components/StartupBrowseSection";
import { projectStageOptions, projectTypeOptions, useProjects } from "@/modules/project/hooks";
import { Project } from "@/modules/project/types";
import { iconSize } from "@/theme/designTokens";
import { MeetingRequestModal } from "@/modules/meeting/components/MeetingRequestModal";

export const ProjectsScreen = () => {
  const colors = useThemeTokens();
  const {
    projects,
    trendingStartups,
    newStartups,
    viewedStartups,
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
  const navigation = useNavigation<any>();
  const selectProject = useCallback((id: string) => navigation.navigate("ProjectDetail", { id }), [navigation]);

  const [
    meetingVisible,
    setMeetingVisible,
    ] = useState(false);
    
    const [
    selectedProject,
    setSelectedProject,
    ] =
    useState<Project | null>(
    null,
    );

    const handleBookMeeting = useCallback((project: Project) => {
      setSelectedProject(project);
      setMeetingVisible(true);
    }, []);

  const renderProject = useCallback<ListRenderItem<Project>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <ProjectCard project={item}
          onPress={(id) => void selectProject(id)}
          onBookMeeting={handleBookMeeting}  
        />
      </View>
    ),
    [selectProject, handleBookMeeting]
  );

  return (
  <>  
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshing={isRefreshing}
        onRefresh={() => void refreshProjects()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="w-full max-w-2xl self-center pb-2 pt-4">
            <View className="mb-5 border-b border-border pb-5">
              <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                Projects & startups
              </AppText>
              <AppText tone="muted" size="sm" className="mt-2 leading-5">
                Discover what the community is building. Share your own to find collaborators, hires, and investors.
              </AppText>

              <View className="relative mt-5">
                <View className="pointer-events-none absolute left-3 top-3.5 z-10">
                  <Feather name="search" size={iconSize.md} color={colors.muted} />
                </View>
                <TextInput
                  value={filters.query}
                  onChangeText={setQuery}
                  placeholder="Search projects, tech, industry..."
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                  className="h-11 rounded-md border border-input bg-background pl-10 pr-3 text-sm text-text"
                />
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {projectStageOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={filters.stage === option.value}
                    onPress={() => setStage(option.value)}
                  />
                ))}
              </View>

              <View className="mt-2 flex-row flex-wrap gap-2">
                {projectTypeOptions.map((option) => (
                  <FilterChip
                    key={option.label}
                    label={option.label}
                    isActive={filters.projectType === option.value}
                    onPress={() => setProjectType(option.value)}
                  />
                ))}
              </View>
            </View>

            <ProjectComposer />

            {trendingStartups.length > 0 ? (
              <View className="mt-6">
                <AppText weight="semibold" size="sm">
                  Trending startups
                </AppText>
                <FlatList
                  data={trendingStartups}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View className="mr-3 w-56">
                      <ProjectCard
                        project={item}
                        compact
                        onPress={(id) => void selectProject(id)}
                        onBookMeeting={handleBookMeeting}
                      />
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                />
              </View>
            ) : null}

            <StartupBrowseSection
              newStartups={newStartups}
              viewedStartups={viewedStartups}
              onPress={(id) => void selectProject(id)}
              onBookMeeting={handleBookMeeting}
            />

            {totalCount > 0 ? (
              <AppText tone="muted" size="xs" className="mb-2 mt-5">
                Showing {totalCount} projects
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="w-full max-w-2xl self-center">
              <UserSkeletonList />
            </View>
          ) : errorMessage ? (
            <View className="w-full max-w-2xl self-center">
              <ErrorState message={errorMessage} onRetry={() => void loadProjects()} />
            </View>
          ) : (
            <View className="w-full max-w-2xl self-center">
              <EmptyState title="No projects match" message="Try a different filter or create the first project." />
            </View>
          )
        }
      />
    </AppScreen>
    <MeetingRequestModal
      visible={meetingVisible}
      startupId={selectedProject?.id ?? ""}
      startupName={selectedProject?.name ?? ""}
      onClose={() => {
        setMeetingVisible(false);
        setSelectedProject(null);
      }}
    />
  </>
  );
};
