import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { useProjectStore } from "@/modules/project/store";

export const InvestmentWatchlistScreen = () => {
  const navigation = useNavigation<any>();
  const { savedStartups, loadSavedStartups } = useProjectStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    void loadSavedStartups();
  }, [loadSavedStartups]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSavedStartups();
    setIsRefreshing(false);
  }, [loadSavedStartups]);

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
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={(id) => navigation.navigate("ProjectDetail", { id })}
              onBookMeeting={() => {}}
            />
          )}
          ListEmptyComponent={<EmptyState title="No saved startups" message="Startups you save will show up here." />}
        />
      </View>
    </AppScreen>
  );
};
