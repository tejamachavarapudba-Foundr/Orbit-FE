import { useState } from "react"; // 🔥 Added useState hook
import { TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useProjectForm } from "@/modules/project/hooks";

export const ProjectComposer = () => {
  const colors = useThemeTokens();
  const [isExpanded, setIsExpanded] = useState(false); // 🔥 State to track visibility
  const { values, setField, submit, isSubmitting, canSubmit } = useProjectForm();

  // Handle clean submission and collapse form back down
  const handleCreate = async () => {
    await submit();
    setIsExpanded(false); 
  };

  // 1. Initial State: Show only the "+ New project" button
  if (!isExpanded) {
    return (
      <View className="mt-2 px-1">
        <AppButton 
          label="+ New project" 
          className="bg-blue-600 self-start px-6"  // Assumed variant based on typical design tokens
          onPress={() => setIsExpanded(true)} 
        />
      </View>
    );
  }

  // 2. Expanded State: Show full creation form
  return (
    <Card className="mt-2">
      <CardContent className="gap-4 p-4">
        <View className="flex-row justify-between items-center">
          <AppText family="display" weight="semibold" size="lg">
            New project
          </AppText>
          {/* Optional: Add a cancel button to close the form without saving */}
          <AppButton 
            label="Cancel" 
            variant="ghost" 
            size="sm"
            onPress={() => setIsExpanded(false)} 
          />
        </View>
        
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
            label="Platform"
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
        
          <AppTextInput
            label="Funding Stage"
            value={values.fundingStage}
            onChangeText={(value) => setField("fundingStage", value)}
            placeholder="Bootstrapped, Pre-Seed, Seed"
         />

          <AppTextInput
            label="Founded Year"
            value={values.foundedYear?.toString() ?? ""}
            onChangeText={(value) =>
            setField("foundedYear", value ? Number(value) : null)}
            keyboardType="numeric"
         />
        <AppTextInput label="Location" value={values.location} onChangeText={(value) => setField("location", value)} />
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
          label="Create project"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() => void handleCreate()}
          className="mt-1"
        />
      </CardContent>
    </Card>
  );
};
