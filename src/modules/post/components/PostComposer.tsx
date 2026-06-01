import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { postCategoryOptions, usePostComposer } from "@/modules/post/hooks";
import { PostCategory, PostMediaType } from "@/modules/post/types";

export const PostComposer = () => {
  const colors = useThemeTokens();
  const { values, isSubmitting, setField, submit, canSubmit } = usePostComposer();
  const [showExtras, setShowExtras] = useState(false);

  const renderCategory = useCallback(
    (option: { label: string; value: PostCategory }) => {
      const isActive = values.category === option.value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          onPress={() => setField("category", option.value)}
          className={`mr-2 h-9 justify-center rounded-md border px-3 ${
            isActive ? "border-primary bg-primary" : "border-border bg-background"
          }`}
        >
          <AppText tone={isActive ? "onPrimary" : "muted"} size="sm" weight="medium">
            {option.label}
          </AppText>
        </Pressable>
      );
    },
    [setField, values.category]
  );

  const clearMedia = () => {
    setField("imageUrl", "");
    setField("mediaType", "none" as PostMediaType);
  };

  return (
    <Card className="mb-6">
      <CardContent className="gap-3 p-4">
        <TextInput
          value={values.content}
          onChangeText={(value) => setField("content", value)}
          placeholder="Share an update, milestone, ad, or announcement…"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          maxLength={5000}
          className="min-h-20 text-base text-text"
        />

        {values.imageUrl.trim() ? (
          <View className="relative">
            <Image
              source={{ uri: values.imageUrl }}
              className="max-h-72 w-full rounded-lg border border-border bg-black"
              resizeMode="cover"
            />
            <Pressable
              accessibilityRole="button"
              onPress={clearMedia}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-md bg-secondary"
            >
              <Feather name="x" size={16} color={colors.text} />
            </Pressable>
          </View>
        ) : null}

        {showExtras ? (
          <View className="gap-2">
            <View className="flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
              <Feather name="link" size={16} color={colors.muted} />
              <TextInput
                value={values.linkUrl}
                onChangeText={(value) => setField("linkUrl", value)}
                placeholder="Link URL (optional)"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                autoCapitalize="none"
                keyboardType="url"
                className="h-11 flex-1 text-sm text-text"
              />
            </View>
            {!values.imageUrl.trim() ? (
              <View className="flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
                <Feather name="image" size={16} color={colors.muted} />
                <TextInput
                  value={values.imageUrl}
                  onChangeText={(value) => {
                    setField("imageUrl", value);
                    if (value.trim()) {
                      setField("mediaType", "image" as PostMediaType);
                    }
                  }}
                  placeholder="Image or video URL"
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                  autoCapitalize="none"
                  keyboardType="url"
                  className="h-11 flex-1 text-sm text-text"
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-10">
          <View className="flex-row pr-2">{postCategoryOptions.map(renderCategory)}</View>
        </ScrollView>

        <View className="flex-row flex-wrap items-center gap-1">
          <AppButton
            label="Photo"
            variant="ghost"
            size="sm"
            leftIcon={<Feather name="image" size={14} color={colors.muted} />}
            onPress={() => {
              setField("mediaType", "image" as PostMediaType);
              setShowExtras(true);
            }}
          />
          <AppButton
            label="Video"
            variant="ghost"
            size="sm"
            leftIcon={<Feather name="video" size={14} color={colors.muted} />}
            onPress={() => {
              setField("mediaType", "video" as PostMediaType);
              setShowExtras(true);
            }}
          />
          <AppButton
            label={showExtras ? "Hide URL" : "Add URL"}
            variant="ghost"
            size="sm"
            leftIcon={<Feather name="link" size={14} color={colors.muted} />}
            onPress={() => setShowExtras((current) => !current)}
          />
          <View className="ml-auto flex-row items-center gap-2">
            <AppText tone="muted" size="xs">
              {values.content.length}/5000
            </AppText>
            <AppButton
              label="Post"
              size="sm"
              loading={isSubmitting}
              disabled={!canSubmit}
              leftIcon={<Feather name="send" size={14} color={colors.onPrimary} />}
              onPress={() => void submit()}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
