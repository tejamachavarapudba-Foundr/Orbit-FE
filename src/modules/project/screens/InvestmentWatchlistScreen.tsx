import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <View className="flex-1 px-4 pt-4">
      <AppText family="display" weight="bold" size="2xl">
        Investment Watchlist
      </AppText>

      <AppText tone="muted" className="mt-1 mb-4">
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
  );
};
