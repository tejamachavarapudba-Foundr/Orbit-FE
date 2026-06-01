import { useCallback } from "react";
import { Pressable, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { postCategoryOptions, usePostComposer } from "@/modules/post/hooks";
import { PostCategory, PostMediaType } from "@/modules/post/types";

export const PostComposer = () => {
  const colors = useThemeTokens();
  const { values, isSubmitting, setField, submit, canSubmit } = usePostComposer();

  const renderCategory = useCallback(
    (option: { label: string; value: PostCategory }) => {
      const isActive = values.category === option.value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          onPress={() => setField("category", option.value)}
          className={`mr-2 rounded-md border px-3 py-2 ${isActive ? "border-primary bg-primary" : "border-border bg-background"}`}
        >
          <AppText tone={isActive ? "onPrimary" : "muted"} size="sm" weight="medium">
            {option.label}
          </AppText>
        </Pressable>
      );
    },
    [setField, values.category]
  );

  return (
    <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <TextInput
        value={values.content}
        onChangeText={(value) => setField("content", value)}
        placeholder="Share an update, milestone, ad, or announcement..."
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        multiline
        textAlignVertical="top"
        maxLength={5000}
        className="min-h-24 rounded-md border border-primary bg-background px-4 py-3 text-base text-text"
      />

      <View className="mt-3 flex-row flex-wrap items-center gap-y-2">
        {postCategoryOptions.map(renderCategory)}
      </View>

      <View className="mt-4 gap-3">
        <AppTextInput
          label="Link URL"
          value={values.linkUrl}
          onChangeText={(value) => setField("linkUrl", value)}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://startuphouze.com"
        />
        <AppTextInput
          label="Image URL"
          value={values.imageUrl}
          onChangeText={(value) => setField("imageUrl", value)}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://..."
        />
      </View>

      <View className="mt-4 flex-row flex-wrap items-center gap-4">
        <Pressable accessibilityRole="button" onPress={() => setField("mediaType", "image" as PostMediaType)}>
          <AppText weight="semibold">Photo</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setField("mediaType", "video" as PostMediaType)}>
          <AppText weight="semibold">Video</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setField("mediaType", "link" as PostMediaType)}>
          <AppText weight="semibold">Add URL</AppText>
        </Pressable>
        <AppText tone="muted" size="sm" className="ml-auto">
          {values.content.length}/5000
        </AppText>
        <AppButton
          label="Post"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() => void submit()}
          className="h-10 px-6"
        />
      </View>
    </View>
  );
};
