import { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Job } from "@/modules/jobs/types";

type JobCardProps = {
  job: Job;
  onPress: (id: string) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));

export const JobCard = memo(({ job, onPress }: JobCardProps) => (
  <Pressable accessibilityRole="button" onPress={() => onPress(job.id)} className="mb-3">
    <Card className="p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <AppText weight="semibold" size="lg" numberOfLines={2}>
            {job.heading}
          </AppText>
          <AppText tone="primary" weight="medium" size="sm" className="mt-1 uppercase tracking-wide">
            {job.startupName}
          </AppText>
        </View>
        <View className="rounded-md border border-border bg-muted-bg px-2.5 py-1">
          <AppText tone="muted" size="xs" weight="medium">
            {job.role}
          </AppText>
        </View>
      </View>

      <AppText tone="muted" size="sm" className="mt-3 leading-5" numberOfLines={2}>
        {job.description || "..."}
      </AppText>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-md border border-border bg-card px-2.5 py-1">
          <AppText tone="muted" size="xs">
            {job.experience}
          </AppText>
        </View>
        {job.skills.slice(0, 4).map((skill) => (
          <View key={skill} className="rounded-md bg-muted-bg px-2.5 py-1">
            <AppText tone="muted" size="xs">
              {skill}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <AppText tone="muted" size="xs">
          {job.applications?.length ?? 0} applications
        </AppText>
        <AppText tone="muted" size="xs">
          {formatDate(job.createdAt)}
        </AppText>
      </View>
    </Card>
  </Pressable>
));

JobCard.displayName = "JobCard";
