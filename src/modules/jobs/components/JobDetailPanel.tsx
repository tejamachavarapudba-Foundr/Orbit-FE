import { useState } from "react";
import { Alert, View } from "react-native";
import { useAuthStore } from "@/modules/auth/store";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { useJobDetail } from "@/modules/jobs/hooks";

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const JobDetailPanel = () => {
  const { selectedJob, mutatingId, clearSelectedJob, deleteJob, updateJob, applyJob, updateApplicationStatus } =
    useJobDetail();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [editHeading, setEditHeading] = useState("");
  const [editSkills, setEditSkills] = useState("");
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
  
  const canApply =
    !canManageJobs;
  
  const isOwner =
    profile?.id === selectedJob.posterId;

  const submitApply = async () => {
    const success = await applyJob(selectedJob.id, applicationMessage.trim() || "Resume + cover letter...");
    if (success) {
      setApplicationMessage("");
    }
  };

  const submitUpdate = async () => {
    const payload = {
      ...(editHeading.trim() ? { heading: editHeading.trim() } : {}),
      ...(editSkills.trim() ? { skills: splitCsv(editSkills) } : {})
    };
    const success = await updateJob(selectedJob.id, payload);
    if (success) {
      setEditHeading("");
      setEditSkills("");
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
        {canApply && (
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
            disabled={!applicationMessage.trim()}
            className="mt-3"
            size="sm"
          />
        </View>
        )}
        {isOwner && (
        <View className="rounded-md border border-border bg-muted-bg p-3">
          <AppText weight="semibold" size="sm">
            Owner tools
          </AppText>
          <AppTextInput label="New heading" value={editHeading} onChangeText={setEditHeading} className="mt-2" />
          <AppTextInput
            label="New skills"
            value={editSkills}
            onChangeText={setEditSkills}
            placeholder="node, prisma, expo"
          />
          <View className="mt-3 flex-row gap-3">
            <AppButton
              label="Update"
              variant="outline"
              loading={isMutating}
              disabled={!editHeading.trim() && !editSkills.trim()}
              onPress={() => void submitUpdate()}
              className="flex-1"
              size="sm"
            />
            <AppButton
              label="Delete"
              variant="outline"
              loading={isMutating}
              onPress={() =>
                Alert.alert("Delete job", `Delete ${selectedJob.heading}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => void deleteJob(selectedJob.id) }
                ])
              }
              className="flex-1"
              size="sm"
            />
          </View>
        </View>
        )}
        <View>
          <AppText weight="semibold" size="sm">
            Applications ({applications.length})
          </AppText>
          <View className="mt-2 gap-2">
            {applications.length ? (
              applications.map((application) => (
                <View key={application.id} className="rounded-md border border-border bg-card p-3">
                  <AppText weight="medium" size="sm" className="capitalize">
                    {application.status}
                  </AppText>
                  <AppText tone="muted" size="sm" className="mt-1 leading-5">
                    {application.message}
                  </AppText>
                  <View className="mt-2 flex-row gap-2">
                    <AppButton
                      label="Accept"
                      size="sm"
                      loading={mutatingId === application.id}
                      onPress={() => void updateApplicationStatus(selectedJob.id, application.id, "accepted")}
                    />
                    <AppButton
                      label="Reject"
                      variant="outline"
                      size="sm"
                      loading={mutatingId === application.id}
                      onPress={() => void updateApplicationStatus(selectedJob.id, application.id, "rejected")}
                    />
                  </View>
                </View>
              ))
            ) : (
              <AppText tone="muted" size="sm">
                No applications yet.
              </AppText>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
