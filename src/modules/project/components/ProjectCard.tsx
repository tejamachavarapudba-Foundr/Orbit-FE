import { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Project } from "@/modules/project/types";

type ProjectCardProps = {
  project: Project;
  onPress: (id: string) => void;
};

const formatValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const ProjectCard = memo(({ project, onPress }: ProjectCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={() => onPress(project.id)}
    className="rounded-md border border-border bg-surface p-5 shadow-sm"
  >
    <View className="flex-row gap-4">
      <View className="h-14 w-14 items-center justify-center rounded-md bg-primary">
        <AppText tone="onPrimary" weight="bold" size="xl">
          {(project.name || "S").charAt(0).toUpperCase()}
        </AppText>
      </View>
      <View className="flex-1">
        <View className="flex-row items-start gap-3">
          <View className="flex-1">
            <AppText weight="bold" size="lg">
              {project.name || "Untitled project"}
            </AppText>
            <AppText tone="primary" weight="medium" className="mt-1">
              {project.tagline || formatValue(project.stage)}
            </AppText>
          </View>
          <View className="rounded-md bg-primary/10 px-3 py-1">
            <AppText tone="primary" size="sm" weight="semibold">
              {formatValue(project.projectType || project.category || "startup")}
            </AppText>
          </View>
        </View>
        <AppText className="mt-4 leading-6" numberOfLines={3}>
          {project.description || project.pitch || "No description yet."}
        </AppText>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <View className="rounded-md bg-background px-3 py-2">
            <AppText tone="muted" size="sm">
              {formatValue(project.stage || "idea")}
            </AppText>
          </View>
          <View className="rounded-md bg-background px-3 py-2">
            <AppText tone="muted" size="sm">
              Team {project.teamSize || 1}
            </AppText>
          </View>
          {project.location ? (
            <View className="rounded-md bg-background px-3 py-2">
              <AppText tone="muted" size="sm">
                {project.location}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  </Pressable>
));

ProjectCard.displayName = "ProjectCard";
