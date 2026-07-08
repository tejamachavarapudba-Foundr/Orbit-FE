import { useState } from "react";
import { TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useJobs } from "@/modules/jobs/hooks";

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const JobComposer = () => {
  const colors = useThemeTokens();
  const { createJob, isCreating } = useJobs();
  const [isExpanded, setIsExpanded] = useState(false);
  const [startupName, setStartupName] = useState("");
  const [heading, setHeading] = useState("");
  const [role, setRole] = useState("engineer");
  const [experience, setExperience] = useState("3+ yrs");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = startupName.trim() && heading.trim() && role.trim() && description.trim();

  const reset = () => {
    setStartupName("");
    setHeading("");
    setRole("engineer");
    setExperience("3+ yrs");
    setSkills("");
    setDescription("");
    setIsExpanded(false);
  };

  const submit = async () => {
    const success = await createJob({
      startupName: startupName.trim(),
      heading: heading.trim(),
      role: role.trim(),
      experience: experience.trim(),
      skills: splitCsv(skills),
      description: description.trim()
    });

    if (success) {
      reset();
    }
  };

  if (!isExpanded) {
    return (
      <Card>
        <CardContent className="flex-row items-center justify-between gap-3 p-4">
          <View className="min-w-0 flex-1">
            <AppText weight="semibold">Hiring for your startup?</AppText>
            <AppText tone="muted" size="sm" className="mt-1 leading-5">
              Only primary startup founders can publish job vacancies.
            </AppText>
          </View>
          <AppButton label="Post job" size="sm" onPress={() => setIsExpanded(true)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="gap-3 p-4">
        <AppText weight="semibold" size="lg">
          New job
        </AppText>
        <AppTextInput label="Startup name" value={startupName} onChangeText={setStartupName} />
        <AppTextInput label="Heading" value={heading} onChangeText={setHeading} />
        <View className="flex-row gap-3">
          <AppTextInput label="Role" value={role} onChangeText={setRole} className="flex-1" />
          <AppTextInput label="Experience" value={experience} onChangeText={setExperience} className="flex-1" />
        </View>
        <AppTextInput label="Skills" value={skills} onChangeText={setSkills} placeholder="node, postgres, expo" />
        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Description
          </AppText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Role responsibilities and requirements..."
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="min-h-24 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
        </View>
        <View className="flex-row gap-3">
          <AppButton label="Cancel" variant="outline" onPress={() => setIsExpanded(false)} className="flex-1" />
          <AppButton
            label="Publish"
            loading={isCreating}
            disabled={!canSubmit}
            onPress={() => void submit()}
            className="flex-1"
          />
        </View>
      </CardContent>
    </Card>
  );
};
