import { memo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useProjectStore } from "@/modules/project/store";
import { useAuthStore } from "@/modules/auth/store";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { Project } from "@/modules/project/types";
import { iconSize } from "@/theme/designTokens";

type ProjectCardProps = {
  project: Project;
  onPress: (id: string) => void;
  onBookMeeting: (
    project: Project,
  ) => void;
};

const formatValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const ProjectCard = memo(({ project, onPress, onBookMeeting }: ProjectCardProps) => {
  const colors = useThemeTokens();
  console.log("Project Logo:", project.logoUrl);
  const savedStartupIds =
    useProjectStore(
      (state) => state.savedStartupIds
    );

  const toggleSaveStartup =
    useProjectStore(
      (state) => state.toggleSaveStartup
    );

  const isSaved =
    savedStartupIds.includes(
      project.id
    );

  const user = useAuthStore(
    (state) => state.user
  );
  
  const isInvestor =
    user?.profile?.role === "investor";
  const initial = (project.name || "S").charAt(0).toUpperCase();

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(project.id)} className="mb-6">
      <Card className="overflow-hidden">
        <View className="h-24 bg-primary/15" />
        <View className="px-4 pb-4">
        <View className="-mt-8 mb-3 h-14 w-14 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {project.logoUrl ? (
            <Image
              source={{ uri: project.logoUrl }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />
         ) : (
          <View className="flex-1 items-center justify-center">
            <AppText
              weight="bold"
              size="xl"
              tone="primary"
            >
             {initial}
            </AppText>
          </View>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <AppText family="display" weight="semibold" size="lg" numberOfLines={1}>
            {project.name || "Untitled project"}
          </AppText>

          <Pressable
            onPress={() =>
              toggleSaveStartup(
                project.id
              )
            }
          >
            <Feather
              name="heart"
              size={18}
              color={
                isSaved
                  ? "#ef4444"
                  : colors.muted
              }
            />
          </Pressable>
        </View>

          <AppText tone="muted" size="sm" className="mt-1" numberOfLines={2}>
            {project.tagline || formatValue(project.stage)}
          </AppText>
          
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
          
          <View className="mt-3 gap-2">

            {project.fundingStage ? (
              <View className="flex-row items-center gap-2">
                <Feather name="dollar-sign" size={12} color={colors.muted} />
                <AppText tone="muted" size="xs">
                  {project.fundingStage}
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

             {project.pitchVideoUrl ? (
               <View className="flex-row items-center gap-2">
                 <Feather name="play-circle" size={12} color={colors.primary} />
                 <AppText tone="primary" size="xs">
                   Founder Pitch Available
                 </AppText>
               </View>
             ) : null}

          </View>

          <AppText size="sm" className="mt-3 leading-5" numberOfLines={3}>
            {project.description || project.pitch || "No description yet."}
          </AppText>

          {/* ADD ONLY THIS SEPARATE MEETING ENTRY BLOCK */}
          {isInvestor && (
            <View className="mt-4 pt-3 border-t border-border flex-row justify-end">
              <Pressable 
                onPress={() => onBookMeeting(project)}
                style={{ backgroundColor: colors.primary }}
                className="px-4 py-2.5 rounded-xl flex-row items-center"
              >
                <Feather name="calendar" size={16} color="#fff" />
                <AppText weight="semibold" size="sm" className="text-white ml-2">
                  Book Meeting
                </AppText>
              </Pressable>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
});

ProjectCard.displayName = "ProjectCard";
