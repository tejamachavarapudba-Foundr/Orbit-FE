import { useState } from "react";
import { FlatList, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CreateMeetingModal } from "@/modules/meeting/components/CreateMeetingModal";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { Project } from "@/modules/project/types";
import { useSavedStartups } from "@/modules/project/hooks";

export const InvestmentWatchlistScreen = () => {
  const navigation = useNavigation<any>();
  const { savedStartups, isRefreshing, refresh } = useSavedStartups();
  const [meetingProject, setMeetingProject] = useState<Project | null>(null);

  return (
    <AppScreen>
      <ScreenHeader title="Investment Watchlist" />
      <View className="flex-1">
        <AppText tone="muted" className="mb-4">
          Saved startups for review
        </AppText>

        <FlatList
          data={savedStartups}
          keyExtractor={(item) => item.id}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={(id) => navigation.navigate("ProjectDetail", { id })}
              onBookMeeting={() => setMeetingProject(item)}
              onViewFounder={(ownerId) => navigation.navigate("UserProfile", { userId: ownerId })}
            />
          )}
          ListEmptyComponent={<EmptyState title="No saved startups" message="Startups you save will show up here." />}
        />
      </View>
      <CreateMeetingModal
        visible={Boolean(meetingProject)}
        startupId={meetingProject?.id}
        onClose={() => setMeetingProject(null)}
      />
    </AppScreen>
  );
};
