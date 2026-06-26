import { FlatList, View } from "react-native";
import { useEffect } from "react";
import { AppText } from "@/components/ui/AppText";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { useProjectStore } from "@/modules/project/store";
import { ProjectDetailPanel } from "@/modules/project/components/ProjectDetailPanel";
import { useProjectDetail } from "@/modules/project/hooks";

export const InvestmentWatchlistScreen = () => {
    const {
        savedStartups,
        loadSavedStartups,
      } = useProjectStore();
   
      const { selectProject } =
        useProjectDetail();

      useEffect(() => {
        void loadSavedStartups();
      }, [loadSavedStartups]);

  return (
    <View className="flex-1 px-4 pt-4">

      <AppText
        family="display"
        weight="bold"
        size="2xl"
      >
        Investment Watchlist
      </AppText>

      <AppText
        tone="muted"
        className="mt-1 mb-4"
      >
        Saved startups for review
      </AppText>
      
      <ProjectDetailPanel />
      
      <FlatList
        data={savedStartups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={(id) =>
              void selectProject(id)
            }  
          />
        )}
      />
    </View>
  );
};