import { memo } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { Project } from "@/modules/project/types";
import { iconSize } from "@/theme/designTokens";

type ProjectCardProps = {
  project: Project;
  onPress: (id: string) => void;
};

const formatValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const ProjectCard = memo(({ project, onPress }: ProjectCardProps) => {
  const colors = useThemeTokens();
  const initial = (project.name || "S").charAt(0).toUpperCase();

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(project.id)} className="mb-4">
      <Card className="overflow-hidden">
        <View className="h-24 bg-primary/15" />
        <View className="px-4 pb-4">
          <View className="-mt-8 mb-3 h-14 w-14 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
            <AppText weight="bold" size="xl" tone="primary">
              {initial}
            </AppText>
          </View>

          <AppText family="display" weight="semibold" size="lg" numberOfLines={1}>
            {project.name || "Untitled project"}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-1" numberOfLines={2}>
            {project.tagline || formatValue(project.stage)}
          </AppText>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <Badge label={formatValue(project.stage || "idea")} variant="outline" />
            {project.location ? (
              <View className="flex-row items-center gap-1 rounded-md border border-border bg-muted-bg px-2 py-1">
                <Feather name="map-pin" size={12} color={colors.muted} />
                <AppText tone="muted" size="xs">
                  {project.location}
                </AppText>
              </View>
            ) : null}
            <View className="flex-row items-center gap-1 rounded-md border border-border bg-muted-bg px-2 py-1">
              <Feather name="users" size={12} color={colors.muted} />
              <AppText tone="muted" size="xs">
                Team {project.teamSize || 1}
              </AppText>
            </View>
          </View>

          <AppText size="sm" className="mt-3 leading-5" numberOfLines={3}>
            {project.description || project.pitch || "No description yet."}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
});

ProjectCard.displayName = "ProjectCard";
