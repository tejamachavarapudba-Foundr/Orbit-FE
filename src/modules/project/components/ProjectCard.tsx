import { memo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useProjectStore } from "@/modules/project/store";
import { useAuthStore } from "@/modules/auth/store";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal";
import { ProjectBannerGradient } from "@/modules/project/components/ProjectBannerGradient";
import { Project } from "@/modules/project/types";
import { ProjectBadge } from "@/modules/project/utils";

type ProjectCardProps = {
  project: Project;
  onPress: (id: string) => void;
  onBookMeeting: (project: Project) => void;
  onEdit?: (id: string) => void;
  onViewFounder?: (ownerId: string) => void;
  compact?: boolean;
  badge?: ProjectBadge;
};

// Inline colors instead of AppText's fixed tone set — "danger" red read as
// an alert/error rather than "hot", so Trending gets its own warm amber.
const badgeColors: Record<ProjectBadge, { bg: string; text: string }> = {
  New: { bg: "rgba(37, 99, 235, 0.1)", text: "#2563eb" },
  Trending: { bg: "rgba(245, 158, 11, 0.14)", text: "#b45309" },
  "Best liked": { bg: "rgba(22, 163, 74, 0.1)", text: "#16a34a" },
  Viewed: { bg: "rgba(100, 116, 139, 0.12)", text: "#64748b" }
};

const formatValue = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const ProjectCard = memo(({ project, onPress, onBookMeeting, onEdit, onViewFounder, compact = false, badge }: ProjectCardProps) => {
  const colors = useThemeTokens();
  const savedStartupIds = useProjectStore((state) => state.savedStartupIds);
  const toggleSaveStartup = useProjectStore((state) => state.toggleSaveStartup);
  const toggleLikeStartup = useProjectStore((state) => state.toggleLikeStartup);
  const isSaved = savedStartupIds.includes(project.id);
  const isLiked = Boolean(project.isLikedByMe);
  const likeCount = project.likeCount ?? 0;
  const user = useAuthStore((state) => state.user);
  const isInvestor = user?.profile?.role === "investor";
  const isOwner = user?.profile?.id === project.ownerId;
  const initial = (project.name || "S").charAt(0).toUpperCase();
  const [showPitchVideo, setShowPitchVideo] = useState(false);
  const hasFounderOffer = Boolean(project.askAmount.trim() || project.equityPercent.trim());

  return (
    <>
    <Pressable accessibilityRole="button" onPress={() => onPress(project.id)} className="mb-6">
      <Card className="overflow-hidden">
        {project.coverUrl ? (
          <Image
            source={{ uri: project.coverUrl }}
            style={{ width: "100%", height: compact ? 64 : 96 }}
            resizeMode="cover"
          />
        ) : (
          <ProjectBannerGradient projectType={project.projectType} height={compact ? 64 : 96} />
        )}
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
            <View className="flex-1 flex-row items-center gap-1.5 pr-2">
              <AppText family="display" weight="semibold" size={compact ? "base" : "lg"} numberOfLines={1} className="flex-shrink">
                {project.name || "Untitled project"}
              </AppText>
              {project.founderVerified ? <VerifiedBadge /> : null}
            </View>

            <View className="flex-row items-center gap-2.5">
              {badge ? (
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: badgeColors[badge].bg }}>
                  <AppText size="xs" weight="semibold" style={{ color: badgeColors[badge].text }}>
                    {badge}
                  </AppText>
                </View>
              ) : null}
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
                accessibilityLabel={isLiked ? "Unlike startup" : "Like startup"}
                onPress={(event) => {
                  event.stopPropagation?.();
                  void toggleLikeStartup(project.id);
                }}
                className="flex-row items-center gap-1"
              >
                <Feather name="thumbs-up" size={17} color={isLiked ? colors.primary : colors.muted} />
                {likeCount > 0 ? (
                  <AppText size="xs" tone={isLiked ? "primary" : "muted"}>
                    {likeCount}
                  </AppText>
                ) : null}
              </Pressable>
              {isInvestor ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? "Unsave startup" : "Save startup"}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    toggleSaveStartup(project.id);
                  }}
                >
                  <Feather name="bookmark" size={18} color={isSaved ? colors.primary : colors.muted} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <AppText tone="muted" size="sm" className="mt-1" numberOfLines={compact ? 1 : 2}>
            {project.tagline || formatValue(project.stage)}
          </AppText>

          {onViewFounder ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View founder profile"
              onPress={(event) => {
                event.stopPropagation?.();
                onViewFounder(project.ownerId);
              }}
              className="mt-2 flex-row items-center gap-1.5 self-start"
            >
              <Feather name="user" size={12} color={colors.muted} />
              <AppText tone="muted" size="xs">
                Founder ·
              </AppText>
              <AppText tone="primary" size="xs" weight="semibold">
                View profile
              </AppText>
            </Pressable>
          ) : null}

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
                setShowPitchVideo(true);
              }}
              className="mt-3 flex-row items-center gap-2 self-start rounded-md bg-primary/10 px-3 py-2"
            >
              <Feather name="play-circle" size={16} color={colors.primary} />
              <AppText tone="primary" size="xs" weight="semibold">
                Watch Founder Pitch
              </AppText>
            </Pressable>
          ) : null}

          {hasFounderOffer ? (
            <View className="mt-3 rounded-md border border-border bg-muted-bg px-3 py-2">
              <AppText tone="muted" size="xs" weight="bold" className="text-center">
                FOUNDER&apos;S OFFER
              </AppText>
              <View className="mt-1.5 flex-row items-center justify-between">
                <AppText tone="muted" size="xs">
                  ASK
                </AppText>
                <AppText size="xs" weight="semibold">
                  {project.askAmount || "—"}
                </AppText>
              </View>
              <View className="mt-1 flex-row items-center justify-between">
                <AppText tone="muted" size="xs">
                  EQUITY %
                </AppText>
                <AppText size="xs" weight="semibold">
                  {project.equityPercent ? `${project.equityPercent}%` : "—"}
                </AppText>
              </View>
            </View>
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
                  Team {project.teamMemberCount ?? 0}
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
    {project.pitchVideoUrl ? (
      <VideoPlayerModal visible={showPitchVideo} uri={project.pitchVideoUrl} onClose={() => setShowPitchVideo(false)} />
    ) : null}
    </>
  );
});

ProjectCard.displayName = "ProjectCard";
