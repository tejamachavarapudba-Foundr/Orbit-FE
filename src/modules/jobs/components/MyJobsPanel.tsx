import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { jobsApi } from "@/modules/jobs/api";
import { useJobsStore } from "@/modules/jobs/store";
import { Job, JobApplication, JobApplicationStatus } from "@/modules/jobs/types";
import { iconSize } from "@/theme/designTokens";
import { toAppError } from "@/utils/errors";
import { useToastStore } from "@/store/toastStore";

type StatusFilter = "all" | JobApplicationStatus;

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" }
];

const formatAppliedAt = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));

const StatusFilterRow = ({ value, onChange }: { value: StatusFilter; onChange: (next: StatusFilter) => void }) => (
  <View className="flex-row flex-wrap gap-2">
    {STATUS_FILTERS.map((filter) => (
      <FilterChip
        key={filter.value}
        label={filter.label}
        isActive={value === filter.value}
        activeTone="primary"
        onPress={() => onChange(filter.value)}
      />
    ))}
  </View>
);

type MyApplicationsPanelProps = {
  visible: boolean;
};

export const MyApplicationsPanel = ({ visible }: MyApplicationsPanelProps) => {
  const [applications, setApplications] = useState<(JobApplication & { job: Job })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  const filtered = statusFilter === "all" ? applications : applications.filter((item) => item.status === statusFilter);

  return (
    <View className="mt-4 gap-3">
      <StatusFilterRow value={statusFilter} onChange={setStatusFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          title={applications.length === 0 ? "No applications yet" : "No applications here"}
          message={
            applications.length === 0
              ? "Jobs you apply to will show up here with their status."
              : "Try a different status filter."
          }
        />
      ) : (
        filtered.map((application) => (
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
            <AppText tone="muted" size="xs" className="mt-2">
              Applied {formatAppliedAt(application.createdAt)}
            </AppText>
          </Card>
        ))
      )}
    </View>
  );
};

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type ApplicationRowProps = {
  jobId: string;
  application: JobApplication;
  onChanged: () => void;
};

const ApplicationRow = ({ jobId, application, onChanged }: ApplicationRowProps) => {
  const mutatingId = useJobsStore((state) => state.mutatingId);
  const updateApplicationStatus = useJobsStore((state) => state.updateApplicationStatus);
  const [isFetchingResume, setIsFetchingResume] = useState(false);

  const openResume = async () => {
    setIsFetchingResume(true);
    try {
      const { url } = await jobsApi.getApplicationResumeUrl(jobId, application.id);
      await Linking.openURL(url);
    } catch (error) {
      const appError = toAppError(error);
      useToastStore.getState().show({ type: "error", title: "Couldn't open resume", message: appError.message });
    } finally {
      setIsFetchingResume(false);
    }
  };

  return (
    <View className="rounded-md border border-border bg-card p-3">
      <View className="flex-row items-center justify-between">
        <AppText weight="medium" size="sm">
          {application.applicant?.fullName ?? "Applicant"}
        </AppText>
        <Badge label={application.status} variant="outline" />
      </View>
      <AppText tone="muted" size="sm" className="mt-1 leading-5">
        {application.message}
      </AppText>
      <AppText tone="muted" size="xs" className="mt-1">
        Applied {formatAppliedAt(application.createdAt)}
      </AppText>

      <Pressable
        accessibilityRole="button"
        onPress={() => void openResume()}
        disabled={isFetchingResume}
        className="mt-2 flex-row items-center gap-2 rounded-md border border-border bg-muted-bg px-3 py-2"
      >
        <Feather name="file-text" size={iconSize.sm} />
        <AppText size="sm" className="flex-1" numberOfLines={1}>
          {application.resumeFileName ?? "Resume"}
        </AppText>
        {isFetchingResume ? <ActivityIndicator size="small" /> : <Feather name="download" size={iconSize.sm} />}
      </Pressable>

      {application.status === "pending" ? (
        <View className="mt-2 flex-row gap-2">
          <AppButton
            label="Accept"
            size="sm"
            loading={mutatingId === application.id}
            onPress={() => void updateApplicationStatus(jobId, application.id, "accepted").then((success) => success && onChanged())}
          />
          <AppButton
            label="Reject"
            variant="outline"
            size="sm"
            loading={mutatingId === application.id}
            onPress={() => void updateApplicationStatus(jobId, application.id, "rejected").then((success) => success && onChanged())}
          />
        </View>
      ) : null}
    </View>
  );
};

type MyJobPostCardProps = {
  post: Job;
  statusFilter: StatusFilter;
  onChanged: () => void;
};

const MyJobPostCard = ({ post, statusFilter, onChanged }: MyJobPostCardProps) => {
  const colors = useThemeTokens();
  const mutatingId = useJobsStore((state) => state.mutatingId);
  const updateJob = useJobsStore((state) => state.updateJob);
  const deleteJob = useJobsStore((state) => state.deleteJob);

  const [isEditing, setIsEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(post.heading);
  const [editSkills, setEditSkills] = useState((post.skills ?? []).join(", "));

  const applications = post.applications ?? [];
  const visibleApplications =
    statusFilter === "all" ? applications : applications.filter((item) => item.status === statusFilter);
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

  if (statusFilter !== "all" && visibleApplications.length === 0) {
    return null;
  }

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

      {visibleApplications.length > 0 ? (
        <View className="mt-3 gap-2">
          {visibleApplications.map((application) => (
            <ApplicationRow key={application.id} jobId={post.id} application={application} onChanged={onChanged} />
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  const visiblePosts =
    statusFilter === "all"
      ? posts
      : posts.filter((post) => (post.applications ?? []).some((application) => application.status === statusFilter));

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
        <StatusFilterRow value={statusFilter} onChange={setStatusFilter} />
        {posts.length === 0 ? (
          <EmptyState title="No job posts yet" message="Jobs you post will show up here." />
        ) : visiblePosts.length === 0 ? (
          <EmptyState title="No applications here" message="Try a different status filter." />
        ) : (
          visiblePosts.map((post) => (
            <MyJobPostCard key={post.id} post={post} statusFilter={statusFilter} onChanged={reload} />
          ))
        )}
      </View>
    </View>
  );
};
