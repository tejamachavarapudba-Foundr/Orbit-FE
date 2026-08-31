import { useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { ProjectFilterModal } from "@/modules/project/components/ProjectFilterModal";
import { useProjects } from "@/modules/project/hooks";
import { Project } from "@/modules/project/types";
import { iconSize } from "@/theme/designTokens";
import { CreateMeetingModal } from "@/modules/meeting/components/CreateMeetingModal";

export const ProjectsScreen = () => {
  const colors = useThemeTokens();
  const isFounder = useAuthStore((state) => state.user?.profile?.role === "founder");
  const {
    projects,
    badgesByProjectId,
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
  const editProject = useCallback(
    (id: string) => navigation.navigate("ProjectDetail", { id, edit: true }),
    [navigation],
  );
  const viewFounder = useCallback(
    (ownerId: string) => navigation.navigate("UserProfile", { userId: ownerId }),
    [navigation],
  );

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

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const hasActiveFilters = filters.stage !== "all" || filters.projectType !== "all";

  const renderProject = useCallback<ListRenderItem<Project>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <ProjectCard
          project={item}
          {...(badgesByProjectId[item.id] ? { badge: badgesByProjectId[item.id] } : {})}
          onPress={(id) => void selectProject(id)}
          onEdit={editProject}
          onBookMeeting={handleBookMeeting}
          onViewFounder={viewFounder}
        />
      </View>
    ),
    [selectProject, editProject, handleBookMeeting, viewFounder, badgesByProjectId]
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

              <View className="mt-5 flex-row items-center gap-2">
                <View className="relative flex-1">
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
            </View>

            {totalCount > 0 ? (
              <AppText tone="muted" size="xs" className="mb-2">
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

      {fabMenuOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={() => setFabMenuOpen(false)}
          className="absolute bottom-0 left-0 right-0 top-0"
        />
      ) : null}

      <View className="absolute bottom-6 right-5 items-end gap-3">
        {fabMenuOpen ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pitch videos"
              onPress={() => {
                setFabMenuOpen(false);
                navigation.navigate("PitchReels");
              }}
              className="flex-row items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-lg"
            >
              <Feather name="film" size={iconSize.md} color={colors.text} />
              <AppText size="sm" weight="medium">
                Pitch videos
              </AppText>
            </Pressable>

            {isFounder ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New project"
                onPress={() => {
                  setFabMenuOpen(false);
                  navigation.navigate("CreateProject");
                }}
                className="flex-row items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-lg"
              >
                <Feather name="plus" size={iconSize.md} color={colors.text} />
                <AppText size="sm" weight="medium">
                  New project
                </AppText>
              </Pressable>
            ) : null}
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fabMenuOpen ? "Close menu" : "Open menu"}
          onPress={() => setFabMenuOpen((current) => !current)}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary/70 shadow-lg"
        >
          <Feather name={fabMenuOpen ? "x" : "more-vertical"} size={iconSize.lg} color={colors.onPrimary} />
        </Pressable>
      </View>
    </AppScreen>
    <CreateMeetingModal
      visible={meetingVisible}
      startupId={selectedProject?.id}
      onClose={() => {
        setMeetingVisible(false);
        setSelectedProject(null);
      }}
    />
    <ProjectFilterModal
      visible={filterModalVisible}
      onClose={() => setFilterModalVisible(false)}
      stage={filters.stage}
      projectType={filters.projectType}
      onSetStage={setStage}
      onSetProjectType={setProjectType}
    />
  </>
  );
};
