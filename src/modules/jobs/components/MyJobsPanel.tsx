import { useEffect, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { jobsApi } from "@/modules/jobs/api";
import { Job, JobApplication } from "@/modules/jobs/types";

type MyApplicationsPanelProps = {
  visible: boolean;
};

export const MyApplicationsPanel = ({ visible }: MyApplicationsPanelProps) => {
  const [applications, setApplications] = useState<(JobApplication & { job: Job })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    jobsApi
      .getMyApplications()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, [visible]);

  if (!visible) return null;

  if (isLoading) {
    return (
      <View className="mt-4 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </View>
    );
  }

  if (applications.length === 0) {
    return (
      <View className="mt-4">
        <EmptyState title="No applications yet" message="Jobs you apply to will show up here with their status." />
      </View>
    );
  }

  return (
    <View className="mt-4 gap-3">
      {applications.map((application) => (
        <Card key={application.id} className="p-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <AppText weight="semibold">{application.job.heading}</AppText>
              <AppText tone="muted" size="sm" className="mt-1">
                {application.job.startupName}
              </AppText>
            </View>
            <Badge label={application.status} variant="outline" />
          </View>
        </Card>
      ))}
    </View>
  );
};

type MyPostsAnalyticsPanelProps = {
  visible: boolean;
};

export const MyPostsAnalyticsPanel = ({ visible }: MyPostsAnalyticsPanelProps) => {
  const [posts, setPosts] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalPosts: number;
    totalApplications: number;
    accepted: number;
    rejected: number;
    pending: number;
    onboardCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    Promise.all([jobsApi.getMyPosts(), jobsApi.getMyAnalytics()])
      .then(([myPosts, myAnalytics]) => {
        setPosts(myPosts);
        setAnalytics(myAnalytics);
      })
      .finally(() => setIsLoading(false));
  }, [visible]);

  if (!visible) return null;

  if (isLoading) {
    return (
      <View className="mt-4 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </View>
    );
  }

  return (
    <View className="mt-4 gap-4">
      {analytics ? (
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-1 min-w-[100px] rounded-md bg-background p-3">
            <AppText tone="muted" size="xs">
              Total applicants
            </AppText>
            <AppText weight="bold" size="lg" className="mt-1">
              {analytics.totalApplications}
            </AppText>
          </View>
          <View className="flex-1 min-w-[100px] rounded-md bg-background p-3">
            <AppText tone="muted" size="xs">
              Accepted
            </AppText>
            <AppText weight="bold" size="lg" className="mt-1">
              {analytics.accepted}
            </AppText>
          </View>
          <View className="flex-1 min-w-[100px] rounded-md bg-background p-3">
            <AppText tone="muted" size="xs">
              Rejected
            </AppText>
            <AppText weight="bold" size="lg" className="mt-1">
              {analytics.rejected}
            </AppText>
          </View>
          <View className="flex-1 min-w-[100px] rounded-md bg-background p-3">
            <AppText tone="muted" size="xs">
              Onboarded
            </AppText>
            <AppText weight="bold" size="lg" className="mt-1">
              {analytics.onboardCount}
            </AppText>
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <AppText weight="bold" size="sm">
          My posts ({posts.length})
        </AppText>
        {posts.length === 0 ? (
          <EmptyState title="No job posts yet" message="Jobs you post will show up here." />
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              <AppText weight="semibold">{post.heading}</AppText>
              <AppText tone="muted" size="sm" className="mt-1">
                {(post.applications ?? []).length} applicants
              </AppText>
            </Card>
          ))
        )}
      </View>
    </View>
  );
};
