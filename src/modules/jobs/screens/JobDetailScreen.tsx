import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { MainStackParamList } from "@/app/navigation/types";
import { ApplicationStatusBadge } from "@/modules/jobs/components/ApplicationStatusBadge";
import { useJobDetail } from "@/modules/jobs/hooks";
import { useJobsStore } from "@/modules/jobs/store";
import { useProfileStore } from "@/modules/profile/store";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

type Props = NativeStackScreenProps<MainStackParamList, "JobDetail">;

const DetailRow = ({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) => {
  const colors = useThemeTokens();
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Feather name={icon} size={iconSize.sm} color={colors.muted} />
      <AppText size="sm">{label}</AppText>
    </View>
  );
};

const formatPostedAt = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "Posted today";
  if (days === 1) return "Posted 1d ago";
  if (days < 30) return `Posted ${days}d ago`;
  return `Posted ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date))}`;
};

// One line per bullet — the composer asks posters for one responsibility
// per line so every job description renders in this same shape. Some
// pasted-in JDs already carry their own bullet marker (•, -, *, "1.") on
// some lines and not others — stripped here so our own bullet is never
// doubled up regardless of what the poster pasted in.
const LEADING_BULLET = /^[•\-*◦‣·]+\s*|^\d+[.)]\s*/;
const descriptionPoints = (description: string) =>
  description
    .split("\n")
    .map((line) => line.trim().replace(LEADING_BULLET, "").trim())
    .filter(Boolean);

export const JobDetailScreen = ({ route }: Props) => {
  const { id } = route.params;
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const profile = useAuthStore((state) => state.user?.profile);
  const updateAuthProfile = useAuthStore((state) => state.updateProfile);
  const updateResume = useProfileStore((state) => state.updateResume);
  const isResumeSaving = useProfileStore((state) => state.isResumeSaving);
  const showToast = useToastStore((state) => state.show);
  const errorMessage = useJobsStore((state) => state.errorMessage);
  const selectJob = useJobsStore((state) => state.selectJob);
  const { selectedJob, mutatingId, clearSelectedJob, applyJob } = useJobDetail();
  const [applicationMessage, setApplicationMessage] = useState("");

  // Uploads straight into the shared profile resume (same field ProfileScreen's
  // ResumeCard shows) so it's usable here immediately and already saved to
  // "My Profile" — no separate job-scoped resume, no second upload later.
  const uploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
        multiple: false
      });

      const file = result.assets?.[0];
      if (result.canceled || !file) return;

      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType || "application/octet-stream" } as any);

      const updated = await updateResume(formData);
      if (!updated) {
        showToast({ type: "error", title: "Resume upload failed" });
        return;
      }

      updateAuthProfile(updated);
      showToast({ type: "success", title: "Resume uploaded" });
    } catch {
      showToast({ type: "error", title: "Resume upload failed" });
    }
  };

  useEffect(() => {
    void selectJob(id);
    return () => clearSelectedJob();
    // Only re-run if navigated to a different job id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isLoading = mutatingId === id && selectedJob?.id !== id;

  const header = (
    <View className="flex-row items-center gap-2 px-4 pb-2 pt-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => navigation.goBack()}
        className="h-9 w-9 items-center justify-center rounded-md"
      >
        <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
      </Pressable>
      <AppText weight="bold" size="lg">
        Job details
      </AppText>
    </View>
  );

  if (isLoading) {
    return (
      <AppScreen withHorizontalPadding={false}>
        {header}
        <View className="gap-3 px-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </View>
      </AppScreen>
    );
  }

  // Only treated as a load failure while we don't yet have a matching
  // selectedJob — once the job has loaded, a later apply failure also sets
  // this same shared errorMessage, but it must not blow away the screen
  // that's already showing valid job details.
  if (!selectedJob || selectedJob.id !== id) {
    return (
      <AppScreen withHorizontalPadding={false}>
        {header}
        <View className="px-4">
          <ErrorState message={errorMessage ?? "This job couldn't be found."} onRetry={() => void selectJob(id)} />
        </View>
      </AppScreen>
    );
  }

  const isMutating = mutatingId === selectedJob.id;
  const applications = selectedJob.applications ?? [];
  const applicationsCount = selectedJob.applicationsCount ?? applications.length;
  const skills = selectedJob.skills ?? [];

  const role = profile?.role;
  const canManageJobs =
    role === "founder" || role === "co_founder" || role === "investor" || role === "hr" || role === "service_provider";
  const isOwner = profile?.id === selectedJob.posterId;
  const myApplication = applications.find((application) => application.applicantId === profile?.id);
  const canApply = !canManageJobs && !isOwner && !myApplication;

  const submitApply = async () => {
    const success = await applyJob(selectedJob.id, applicationMessage.trim() || "Resume + cover letter...");
    if (success) {
      setApplicationMessage("");
    }
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      {header}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <View>
          <Avatar name={selectedJob.startupName} size="xl" fallback="mesh" shape="square" />
          <AppText weight="bold" size="xl" className="mt-3" numberOfLines={3}>
            {selectedJob.heading}
          </AppText>
          <AppText tone="muted" size="base" className="mt-1" numberOfLines={1}>
            {selectedJob.startupName}
          </AppText>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="users" size={iconSize.sm} color={colors.muted} />
            <AppText tone="muted" size="sm">
              {applicationsCount} {applicationsCount === 1 ? "applicant" : "applicants"}
            </AppText>
          </View>
          <AppText tone="muted" size="sm">
            {formatPostedAt(selectedJob.createdAt)}
          </AppText>
        </View>

        <Card>
          <CardContent className="p-4">
            <DetailRow icon="briefcase" label={selectedJob.experience || "Experience not specified"} />
            <DetailRow
              icon="user-plus"
              label={`${selectedJob.openings} ${selectedJob.openings === 1 ? "vacancy" : "vacancies"}`}
            />
            <DetailRow icon="map-pin" label={selectedJob.location || "Location not specified"} />
          </CardContent>
        </Card>

        {skills.length > 0 ? (
          <View>
            <AppText tone="muted" size="sm" weight="medium">
              Must have skills
            </AppText>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {skills.map((skill) => (
                <View key={skill} className="rounded-md bg-muted-bg px-2.5 py-1">
                  <AppText size="xs">{skill}</AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View>
          <AppText weight="bold" size="lg" className="mb-2">
            Job description
          </AppText>
          <Card>
            <CardContent className="gap-3 p-4">
              <View>
                <AppText weight="bold" size="base">
                  What you'll do
                </AppText>
                <AppText tone="muted" size="sm" weight="medium" className="mt-0.5">
                  Role &amp; responsibilities
                </AppText>
              </View>

              <View className="gap-2">
                <AppText size="sm" weight="semibold">
                  Responsibilities
                </AppText>
                {descriptionPoints(selectedJob.description).map((point, index) => (
                  <View key={index} className="flex-row gap-2">
                    <AppText size="sm">•</AppText>
                    <AppText size="sm" className="flex-1 leading-6">
                      {point}
                    </AppText>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>

        {myApplication ? (
          <View className="flex-row items-center gap-2 rounded-md border border-border bg-muted-bg p-3">
            <AppText weight="semibold" size="sm">
              You applied
            </AppText>
            <ApplicationStatusBadge status={myApplication.status} />
          </View>
        ) : canApply ? (
          <View className="rounded-md border border-border bg-muted-bg p-3">
            <AppText weight="semibold" size="sm">
              Apply
            </AppText>
            {!profile?.resumeKey ? (
              <AppText tone="muted" size="sm" className="mt-1 leading-5">
                Upload a resume to apply — it's saved to your profile and attached automatically, no need to re-upload per job.
              </AppText>
            ) : null}
            <AppTextInput
              label="Message"
              value={applicationMessage}
              onChangeText={setApplicationMessage}
              placeholder="Resume + cover letter..."
              multiline
              className="mt-2"
            />
            <View className="mt-3 flex-row gap-2">
              {!profile?.resumeKey ? (
                <AppButton
                  label="Upload resume"
                  variant="outline"
                  size="default"
                  loading={isResumeSaving}
                  onPress={() => void uploadResume()}
                  className="flex-1 rounded-full"
                />
              ) : null}
              <AppButton
                label="Apply for job"
                size="default"
                loading={isMutating}
                disabled={!profile?.resumeKey}
                onPress={() => void submitApply()}
                className="flex-1 rounded-full"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
};
