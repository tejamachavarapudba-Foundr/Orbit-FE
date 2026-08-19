import { useState } from "react";
import { View } from "react-native";
import { useAuthStore } from "@/modules/auth/store";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useJobDetail } from "@/modules/jobs/hooks";

export const JobDetailPanel = () => {
  const { selectedJob, mutatingId, clearSelectedJob, applyJob } = useJobDetail();
  const [applicationMessage, setApplicationMessage] = useState("");
  const profile = useAuthStore((state) => state.user?.profile);

  if (!selectedJob) {
    return null;
  }

  const isMutating = mutatingId === selectedJob.id;
  const applications = selectedJob.applications ?? [];
  const skills = selectedJob.skills ?? [];

  const role = profile?.role;

  const canManageJobs =
    role === "founder" ||
    role === "co_founder" ||
    role === "investor" ||
    role === "hr";

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
    <Card className="mt-4">
      <CardContent className="gap-4 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <AppText weight="semibold" size="lg">
              {selectedJob.heading}
            </AppText>
            <AppText tone="primary" weight="medium" size="sm" className="mt-1 uppercase">
              {selectedJob.startupName}
            </AppText>
            <AppText tone="muted" size="sm" className="mt-1">
              {selectedJob.role} · {selectedJob.experience}
            </AppText>
          </View>
          <AppButton label="Close" variant="outline" size="sm" onPress={clearSelectedJob} />
        </View>

        <AppText size="sm" className="leading-6">
          {selectedJob.description}
        </AppText>

        <View className="flex-row flex-wrap gap-2">
          {skills.map((skill) => (
            <View key={skill} className="rounded-md bg-muted-bg px-2.5 py-1">
              <AppText tone="muted" size="xs">
                {skill}
              </AppText>
            </View>
          ))}
        </View>
        {myApplication ? (
          <View className="flex-row items-center gap-2 rounded-md border border-border bg-muted-bg p-3">
            <AppText weight="semibold" size="sm">
              You applied
            </AppText>
            <Badge label={myApplication.status} variant="outline" />
          </View>
        ) : canApply ? (
        <View className="rounded-md border border-border bg-muted-bg p-3">
          <AppText weight="semibold" size="sm">
            Apply
          </AppText>
          <AppTextInput
            label="Message"
            value={applicationMessage}
            onChangeText={setApplicationMessage}
            placeholder="Resume + cover letter..."
            multiline
            className="mt-2"
          />
          <AppButton
            label="Apply for job"
            loading={isMutating}
            onPress={() => void submitApply()}
            className="mt-3"
            size="sm"
          />
        </View>
        ) : null}
      </CardContent>
    </Card>
  );
};
