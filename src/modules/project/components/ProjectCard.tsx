import { memo } from "react";
import { Image, Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useProjectStore } from "@/modules/project/store";
import { useAuthStore } from "@/modules/auth/store";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { Project } from "@/modules/project/types";

type ProjectCardProps = {
  project: Project;
  onPress: (id: string) => void;
  onBookMeeting: (project: Project) => void;
  onEdit?: (id: string) => void;
  compact?: boolean;
};

const formatValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const ProjectCard = memo(({ project, onPress, onBookMeeting, onEdit, compact = false }: ProjectCardProps) => {
  const colors = useThemeTokens();
  const savedStartupIds = useProjectStore((state) => state.savedStartupIds);
  const toggleSaveStartup = useProjectStore((state) => state.toggleSaveStartup);
  const isSaved = savedStartupIds.includes(project.id);
  const user = useAuthStore((state) => state.user);
  const isInvestor = user?.profile?.role === "investor";
  const isOwner = user?.profile?.id === project.ownerId;
  const initial = (project.name || "S").charAt(0).toUpperCase();

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(project.id)} className="mb-6">
      <Card className="overflow-hidden">
        <View className={compact ? "h-16 bg-primary/15" : "h-24 bg-primary/15"} />
        <View className={compact ? "px-3 pb-3" : "px-4 pb-4"}>
          <View
            className={
              compact
                ? "-mt-6 mb-2 h-11 w-11 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                : "-mt-8 mb-3 h-14 w-14 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            }
          >
            {project.logoUrl ? (
              <Image source={{ uri: project.logoUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <AppText weight="bold" size={compact ? "base" : "xl"} tone="primary">
                  {initial}
                </AppText>
              </View>
            )}
          </View>
          <View className="flex-row items-center justify-between">
            <AppText family="display" weight="semibold" size={compact ? "base" : "lg"} numberOfLines={1} className="flex-1 pr-2">
              {project.name || "Untitled project"}
            </AppText>

            <View className="flex-row items-center gap-2">
              {isOwner ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit project"
                  onPress={(event) => {
                    event.stopPropagation?.();
                    (onEdit ?? onPress)(project.id);
                  }}
                >
                  <Feather name="edit-2" size={16} color={colors.muted} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isSaved ? "Unsave startup" : "Save startup"}
                onPress={(event) => {
                  event.stopPropagation?.();
                  toggleSaveStartup(project.id);
                }}
              >
                <Feather name="heart" size={18} color={isSaved ? "#ef4444" : colors.muted} />
              </Pressable>
            </View>
          </View>

          <AppText tone="muted" size="sm" className="mt-1" numberOfLines={compact ? 1 : 2}>
            {project.tagline || formatValue(project.stage)}
          </AppText>

          {!compact ? (
            <View className="mt-2">
              <AppText size="xs" tone="muted">
                Investor Snapshot
              </AppText>

              <AppText size="xs" weight="semibold">
                {project.investorSnapshot?.isCompleted
                  ? "Published ✓"
                  : `${project.investorSnapshot?.completionPercentage ?? 0}% Complete`}
              </AppText>
            </View>
          ) : null}

          {project.pitchVideoUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Watch founder pitch"
              onPress={(event) => {
                event.stopPropagation?.();
                void Linking.openURL(project.pitchVideoUrl);
              }}
              className="mt-3 flex-row items-center gap-2 self-start rounded-md bg-primary/10 px-3 py-2"
            >
              <Feather name="play-circle" size={16} color={colors.primary} />
              <AppText tone="primary" size="xs" weight="semibold">
                Watch Founder Pitch
              </AppText>
            </Pressable>
          ) : null}

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
            {!compact ? (
              <View className="flex-row items-center gap-1 rounded-md border border-border bg-muted-bg px-2 py-1">
                <Feather name="users" size={12} color={colors.muted} />
                <AppText tone="muted" size="xs">
                  Team {project.teamSize || 1}
                </AppText>
              </View>
            ) : null}
          </View>

          {!compact ? (
            <>
              <View className="mt-3 gap-2">
                {project.fundingStage ? (
                  <View className="flex-row items-center gap-2">
                    <Feather name="dollar-sign" size={12} color={colors.muted} />
                    <AppText tone="muted" size="xs">
                      {formatValue(project.fundingStage)}
                    </AppText>
                  </View>
                ) : null}

                {project.foundedYear ? (
                  <View className="flex-row items-center gap-2">
                    <Feather name="calendar" size={12} color={colors.muted} />
                    <AppText tone="muted" size="xs">
                      Founded {project.foundedYear}
                    </AppText>
                  </View>
                ) : null}

                {project.websiteUrl ? (
                  <View className="flex-row items-center gap-2">
                    <Feather name="globe" size={12} color={colors.muted} />
                    <AppText tone="primary" size="xs" numberOfLines={1}>
                      {project.websiteUrl}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText size="sm" className="mt-3 leading-5" numberOfLines={3}>
                {project.description || project.pitch || "No description yet."}
              </AppText>
            </>
          ) : null}

          {isInvestor ? (
            <View className={compact ? "mt-3 flex-row justify-end" : "mt-4 flex-row justify-end border-t border-border pt-3"}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  onBookMeeting(project);
                }}
                style={{ backgroundColor: colors.primary }}
                className="flex-row items-center rounded-xl px-3 py-2"
              >
                <Feather name="calendar" size={14} color="#fff" />
                <AppText weight="semibold" size="xs" className="text-white ml-2">
                  Book Meeting
                </AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
});

ProjectCard.displayName = "ProjectCard";
