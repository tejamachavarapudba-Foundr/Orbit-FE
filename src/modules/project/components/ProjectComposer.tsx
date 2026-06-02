import { TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useProjectForm } from "@/modules/project/hooks";

export const ProjectComposer = () => {
  const colors = useThemeTokens();
  const { values, setField, submit, isSubmitting, canSubmit } = useProjectForm();

  return (
    <Card className="mt-2">
      <CardContent className="gap-4 p-4">
        <AppText family="display" weight="semibold" size="lg">
          New project
        </AppText>
        <AppText tone="muted" size="sm">
          Share your startup with the Foundr community.
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
          <AppTextInput
            label="Type"
            value={values.projectType}
            onChangeText={(value) => setField("projectType", value)}
            className="flex-1"
          />
          <AppTextInput
            label="Stage"
            value={values.stage}
            onChangeText={(value) => setField("stage", value)}
            className="flex-1"
          />
        </View>

        <AppTextInput label="Location" value={values.location} onChangeText={(value) => setField("location", value)} />
        <AppTextInput
          label="Website"
          value={values.websiteUrl}
          onChangeText={(value) => setField("websiteUrl", value)}
          autoCapitalize="none"
          keyboardType="url"
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
          label="Create project"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() => void submit()}
          className="mt-1"
        />
      </CardContent>
    </Card>
  );
};
