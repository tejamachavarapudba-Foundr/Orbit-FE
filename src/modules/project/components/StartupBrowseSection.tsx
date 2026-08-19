import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { FilterChip } from "@/components/ui/FilterChip";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { Project } from "@/modules/project/types";

type StartupBrowseTab = "new" | "viewed";

type StartupBrowseSectionProps = {
  newStartups: Project[];
  viewedStartups: Project[];
  onPress: (id: string) => void;
  onBookMeeting: (project: Project) => void;
  onEdit?: (id: string) => void;
};

export const StartupBrowseSection = ({
  newStartups,
  viewedStartups,
  onPress,
  onBookMeeting,
  onEdit,
}: StartupBrowseSectionProps) => {
  const [activeTab, setActiveTab] = useState<StartupBrowseTab>("new");

  const tabs = useMemo(
    () => [
      { label: "New Startups", value: "new" as const, count: newStartups.length },
      { label: "Viewed", value: "viewed" as const, count: viewedStartups.length },
    ],
    [newStartups.length, viewedStartups.length],
  );

  const activeStartups = activeTab === "new" ? newStartups : viewedStartups;
  const emptyMessage =
    activeTab === "new"
      ? "You've opened all available startups."
      : "Open a startup card to see it here.";

  return (
    <View className="mt-6">
      <View className="flex-row flex-wrap gap-2">
        {tabs.map((tab) => (
          <FilterChip
            key={tab.value}
            label={`${tab.label} (${tab.count})`}
            isActive={activeTab === tab.value}
            activeTone="primary"
            onPress={() => setActiveTab(tab.value)}
          />
        ))}
      </View>

      {activeStartups.length > 0 ? (
        <FlatList
          data={activeStartups}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mr-3 mt-3 w-56">
              <ProjectCard
                project={item}
                compact
                onPress={onPress}
                onBookMeeting={onBookMeeting}
                {...(onEdit ? { onEdit } : {})}
              />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <View className="mt-3 rounded-md border border-border bg-muted-bg/40 px-4 py-3">
          <AppText tone="muted" size="xs">
            {emptyMessage}
          </AppText>
        </View>
      )}
    </View>
  );
};
