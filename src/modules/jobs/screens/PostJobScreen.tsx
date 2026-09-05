import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { jobRoleOptions, useJobs } from "@/modules/jobs/hooks";
import { PickerSheet } from "@/modules/jobs/components/PickerSheet";
import { SelectField } from "@/modules/jobs/components/SelectField";
import { iconSize } from "@/theme/designTokens";

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const SectionLabel = ({ label }: { label: string }) => (
  <AppText tone="muted" size="xs" weight="semibold" className="uppercase tracking-wide">
    {label}
  </AppText>
);

const ROLE_OPTIONS = jobRoleOptions
  .filter((option) => option !== "all")
  .map((option) => ({ label: option.charAt(0).toUpperCase() + option.slice(1), value: option }));

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "1 yr",
  "2 yrs",
  "3 yrs",
  "4 yrs",
  "5 yrs",
  "6 yrs",
  "7 yrs",
  "8 yrs",
  "9 yrs",
  "10 yrs",
  "12+ yrs",
  "15+ yrs",
  "20+ yrs",
  "30+ yrs"
].map((label) => ({ label, value: label }));

export const PostJobScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation();
  const { createJob, isCreating } = useJobs();
  const [startupName, setStartupName] = useState("");
  const [heading, setHeading] = useState("");
  const [role, setRole] = useState("engineer");
  const [experience, setExperience] = useState("3 yrs");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("1");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [isRolePickerVisible, setIsRolePickerVisible] = useState(false);
  const [isExperiencePickerVisible, setIsExperiencePickerVisible] = useState(false);

  const canSubmit = startupName.trim() && heading.trim() && role.trim() && description.trim();
  const skillChips = splitCsv(skills);

  const submit = async () => {
    const success = await createJob({
      startupName: startupName.trim(),
      heading: heading.trim(),
      role: role.trim(),
      experience: experience.trim(),
      location: location.trim(),
      openings: Math.max(1, parseInt(openings, 10) || 1),
      skills: skillChips,
      description: description.trim()
    });

    if (success) {
      navigation.goBack();
    }
  };

  return (
    <AppScreen withHorizontalPadding={false}>
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
          Post a job
        </AppText>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 20, paddingBottom: 32 }}>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Feather name="briefcase" size={iconSize.md} color={colors.primary} />
          </View>
          <View>
            <AppText weight="bold" size="lg">
              New job
            </AppText>
            <AppText tone="muted" size="xs">
              Fills out the job card and detail screen candidates see.
            </AppText>
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel label="Basics" />
          <AppTextInput
            label="Startup name"
            value={startupName}
            onChangeText={setStartupName}
            placeholder="Your startup"
          />
          <AppTextInput label="Job title" value={heading} onChangeText={setHeading} placeholder="Backend Engineer" />
          <View className="flex-row gap-3">
            <SelectField
              label="Role"
              value={ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role}
              onPress={() => setIsRolePickerVisible(true)}
              className="flex-1"
            />
            <SelectField
              label="Experience"
              value={experience}
              onPress={() => setIsExperiencePickerVisible(true)}
              className="flex-1"
            />
          </View>
        </View>

        <PickerSheet
          visible={isRolePickerVisible}
          onClose={() => setIsRolePickerVisible(false)}
          title="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
        />

        <PickerSheet
          visible={isExperiencePickerVisible}
          onClose={() => setIsExperiencePickerVisible(false)}
          title="Experience"
          options={EXPERIENCE_OPTIONS}
          value={experience}
          onChange={setExperience}
        />

        <View className="gap-3 border-t border-border pt-4">
          <SectionLabel label="Details" />
          <View className="flex-row gap-3">
            <AppTextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="Remote, Bengaluru..."
              containerClassName="flex-1"
            />
            <AppTextInput
              label="Openings"
              value={openings}
              onChangeText={setOpenings}
              keyboardType="number-pad"
              containerClassName="flex-1"
            />
          </View>
          <AppTextInput
            label="Must have skills"
            value={skills}
            onChangeText={setSkills}
            placeholder="node, postgres, expo"
          />
          {skillChips.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {skillChips.map((skill) => (
                <View key={skill} className="rounded-md bg-muted-bg px-2.5 py-1">
                  <AppText size="xs">{skill}</AppText>
                </View>
              ))}
            </View>
          ) : (
            <AppText tone="muted" size="xs">
              Comma-separated — shown as chips on the job card.
            </AppText>
          )}
        </View>

        <View className="gap-2 border-t border-border pt-4">
          <SectionLabel label="Job description" />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="One responsibility per line..."
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="min-h-28 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
          <AppText tone="muted" size="xs">
            One point per line — shown as a bulleted list on the job details screen.
          </AppText>
        </View>

        <AppButton
          label="Publish"
          leftIcon={<Feather name="send" size={iconSize.sm} color={colors.onPrimary} />}
          loading={isCreating}
          disabled={!canSubmit}
          onPress={() => void submit()}
        />
      </ScrollView>
    </AppScreen>
  );
};
