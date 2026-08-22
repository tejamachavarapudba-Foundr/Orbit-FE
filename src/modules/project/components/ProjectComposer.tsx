import { useState } from "react";
import { TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import {
  FUNDING_STAGE_OPTIONS,
  projectStageOptions,
  projectTypeOptions,
  useProjectForm
} from "@/modules/project/hooks";
import { Project } from "@/modules/project/types";

const stageOptions = projectStageOptions.filter((option) => option.value !== "all");
const typeOptions = projectTypeOptions.filter((option) => option.value !== "all");

type ProjectComposerProps = {
  project?: Project | null;
  onDone?: () => void;
  autoExpanded?: boolean;
};

export const ProjectComposer = ({ project = null, onDone, autoExpanded = false }: ProjectComposerProps) => {
  const colors = useThemeTokens();
  const [isExpanded, setIsExpanded] = useState(autoExpanded || Boolean(project));
  const { values, setField, submit, isSubmitting, isEditing, canSubmit } = useProjectForm(project);

  const handleSubmit = async () => {
    const didSucceed = await submit();
    if (didSucceed) {
      setIsExpanded(Boolean(project) && autoExpanded);
      onDone?.();
    }
  };

  if (!isExpanded) {
    return (
      <View className="mt-2 px-1">
        <AppButton label="+ New project" className="self-start px-6" onPress={() => setIsExpanded(true)} />
      </View>
    );
  }

  return (
    <Card className="mt-2">
      <CardContent className="gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <AppText family="display" weight="semibold" size="lg">
            {isEditing ? "Edit project" : "New project"}
          </AppText>
          <AppButton
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={() => {
              setIsExpanded(Boolean(project) && autoExpanded);
              onDone?.();
            }}
          />
        </View>

        <AppText tone="muted" size="sm">
          Share your startup with the Startuphouze community.
        </AppText>

        <AppTextInput label="Project name" value={values.name} onChangeText={(value) => setField("name", value)} />
        <AppTextInput label="Tagline" value={values.tagline} onChangeText={(value) => setField("tagline", value)} />

        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Description
          </AppText>
          <TextInput
            value={values.description}
            onChangeText={(value) => setField("description", value)}
            placeholder="What are you building?"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="min-h-24 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <AppText size="sm" weight="medium">
              Platform
            </AppText>
            <Dropdown
              value={values.projectType}
              options={typeOptions}
              onChange={(value) => {
                setField("projectType", value);
                // Category was folded into Platform — keep it in sync for anything
                // that still reads project.category.
                setField("category", value);
              }}
              placeholder="Platform"
            />
          </View>
          <View className="flex-1 gap-2">
            <AppText size="sm" weight="medium">
              Stage
            </AppText>
            <Dropdown
              value={values.stage}
              options={stageOptions}
              onChange={(value) => setField("stage", value)}
              placeholder="Stage"
            />
          </View>
        </View>

        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Funding Stage
          </AppText>
          <Dropdown
            value={values.fundingStage}
            options={FUNDING_STAGE_OPTIONS}
            onChange={(value) => setField("fundingStage", value)}
            placeholder="Funding stage"
          />
        </View>

        <AppTextInput
          label="Founded Year"
          value={values.foundedYear?.toString() ?? ""}
          onChangeText={(value) => setField("foundedYear", value ? Number(value) : null)}
          keyboardType="numeric"
        />
        <AppTextInput label="Location" value={values.location} onChangeText={(value) => setField("location", value)} />
        <View className="flex-row gap-3">
          <AppTextInput
            label="CIN number"
            value={values.cinNumber}
            onChangeText={(value) => setField("cinNumber", value)}
            autoCapitalize="characters"
            placeholder="U72900KA2020PTC..."
            className="flex-1"
          />
          <AppTextInput
            label="DPIIT number"
            value={values.dpiitNumber}
            onChangeText={(value) => setField("dpiitNumber", value)}
            autoCapitalize="characters"
            placeholder="DIPP..."
            className="flex-1"
          />
        </View>
        <AppTextInput
          label="Website"
          value={values.websiteUrl}
          onChangeText={(value) => setField("websiteUrl", value)}
          autoCapitalize="none"
          keyboardType="url"
        />
        <AppTextInput
          label="Founder Pitch Video URL"
          value={values.pitchVideoUrl}
          onChangeText={(value) => setField("pitchVideoUrl", value)}
          autoCapitalize="none"
          placeholder="https://youtube.com/..."
        />
        <AppTextInput
          label="Tech stack"
          value={values.techStackText}
          onChangeText={(value) => setField("techStackText", value)}
          placeholder="react, node"
        />
        <AppTextInput
          label="Looking for"
          value={values.lookingForText}
          onChangeText={(value) => setField("lookingForText", value)}
          placeholder="engineer, designer"
        />

        <AppButton
          label={isEditing ? "Save changes" : "Create project"}
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() => void handleSubmit()}
          className="mt-1"
        />
      </CardContent>
    </Card>
  );
};
