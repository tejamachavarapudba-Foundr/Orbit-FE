import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ProjectCard } from "@/modules/project/components/ProjectCard";
import { Project } from "@/modules/project/types";
import { getShadowStyle } from "@/theme/shadows";

type StartupBrowseTab = "new" | "viewed";

type StartupBrowseSectionProps = {
  newStartups: Project[];
  viewedStartups: Project[];
  onPress: (id: string) => void;
  onBookMeeting: (project: Project) => void;
};

export const StartupBrowseSection = ({
  newStartups,
  viewedStartups,
  onPress,
  onBookMeeting,
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
      <View className="flex-row rounded-full border border-border bg-background p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Pressable
              key={tab.value}
              accessibilityRole="button"
              onPress={() => setActiveTab(tab.value)}
              className={`flex-1 flex-row items-center justify-center rounded-full px-2 py-2.5 ${
                isActive ? "bg-surface" : "bg-transparent"
              }`}
              style={isActive ? getShadowStyle("card") : undefined}
            >
              <AppText
                tone={isActive ? "default" : "muted"}
                weight="semibold"
                size="xs"
                numberOfLines={1}
                className="text-center"
              >
                {tab.label} ({tab.count})
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {activeStartups.length > 0 ? (
        <FlatList
          data={activeStartups}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mr-3 mt-3 w-72">
              <ProjectCard project={item} onPress={onPress} onBookMeeting={onBookMeeting} />
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
