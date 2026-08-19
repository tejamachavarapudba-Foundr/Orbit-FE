import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { jobsApi } from "@/modules/jobs/api";
import { useJobsStore } from "@/modules/jobs/store";
import { Job, JobApplication } from "@/modules/jobs/types";
import { iconSize } from "@/theme/designTokens";

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

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type MyJobPostCardProps = {
  post: Job;
  onChanged: () => void;
};

const MyJobPostCard = ({ post, onChanged }: MyJobPostCardProps) => {
  const colors = useThemeTokens();
  const mutatingId = useJobsStore((state) => state.mutatingId);
  const updateJob = useJobsStore((state) => state.updateJob);
  const deleteJob = useJobsStore((state) => state.deleteJob);
  const updateApplicationStatus = useJobsStore((state) => state.updateApplicationStatus);

  const [isEditing, setIsEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(post.heading);
  const [editSkills, setEditSkills] = useState((post.skills ?? []).join(", "));

  const applications = post.applications ?? [];
  const isMutating = mutatingId === post.id;

  const submitUpdate = async () => {
    const success = await updateJob(post.id, {
      heading: editHeading.trim() || post.heading,
      skills: splitCsv(editSkills)
    });
    if (success) {
      setIsEditing(false);
      onChanged();
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete job", `Delete ${post.heading}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteJob(post.id).then((success) => success && onChanged())
      }
    ]);
  };

  return (
    <Card className="p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <AppText weight="semibold">{post.heading}</AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            {applications.length} applicants
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit job post"
          onPress={() => setIsEditing((current) => !current)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-md"
        >
          <Feather name="edit-2" size={iconSize.md} color={colors.muted} />
        </Pressable>
      </View>

      {isEditing ? (
        <View className="mt-3 rounded-md border border-border bg-muted-bg p-3">
          <AppTextInput label="Heading" value={editHeading} onChangeText={setEditHeading} />
          <AppTextInput
            label="Skills"
            value={editSkills}
            onChangeText={setEditSkills}
            placeholder="node, prisma, expo"
            className="mt-2"
          />
          <View className="mt-3 flex-row gap-3">
            <AppButton
              label="Update"
              variant="outline"
              loading={isMutating}
              onPress={() => void submitUpdate()}
              className="flex-1"
              size="sm"
            />
            <AppButton label="Delete" variant="outline" loading={isMutating} onPress={confirmDelete} className="flex-1" size="sm" />
          </View>
        </View>
      ) : null}

      {applications.length > 0 ? (
        <View className="mt-3 gap-2">
          {applications.map((application) => (
            <View key={application.id} className="rounded-md border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <AppText weight="medium" size="sm">
                  {application.applicant?.fullName ?? "Applicant"}
                </AppText>
                <Badge label={application.status} variant="outline" />
              </View>
              <AppText tone="muted" size="sm" className="mt-1 leading-5">
                {application.message}
              </AppText>
              {application.status === "pending" ? (
                <View className="mt-2 flex-row gap-2">
                  <AppButton
                    label="Accept"
                    size="sm"
                    loading={mutatingId === application.id}
                    onPress={() =>
                      void updateApplicationStatus(post.id, application.id, "accepted").then(
                        (success) => success && onChanged()
                      )
                    }
                  />
                  <AppButton
                    label="Reject"
                    variant="outline"
                    size="sm"
                    loading={mutatingId === application.id}
                    onPress={() =>
                      void updateApplicationStatus(post.id, application.id, "rejected").then(
                        (success) => success && onChanged()
                      )
                    }
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
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

  const reload = () => {
    Promise.all([jobsApi.getMyPosts(), jobsApi.getMyAnalytics()]).then(([myPosts, myAnalytics]) => {
      setPosts(myPosts);
      setAnalytics(myAnalytics);
    });
  };

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
          posts.map((post) => <MyJobPostCard key={post.id} post={post} onChanged={reload} />)
        )}
      </View>
    </View>
  );
};
