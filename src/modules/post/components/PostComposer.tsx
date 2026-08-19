import { useState } from "react";
import { FlatList, Image, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { postCategoryOptions, usePostComposer } from "@/modules/post/hooks";
import { useToastStore } from "@/store/toastStore";

type PostComposerProps = {
  embedded?: boolean;
  onSuccess?: () => void;
};

export const PostComposer = ({ embedded = false, onSuccess }: PostComposerProps) => {
  const colors = useThemeTokens();
  const { values, isSubmitting, setField, submit, canSubmit } = usePostComposer();
  const [showExtras, setShowExtras] = useState(false);
  const [selectedFiles, setSelectedFiles] =
  useState<ImagePicker.ImagePickerAsset[]>([]);
  const showToast = useToastStore((state) => state.show);
  const MAX_FILES = 10;
  const clearMedia = () => {
    setSelectedFiles([]);
  };
  const removeFileAt = (index: number) => {
    setSelectedFiles((current) => current.filter((_, i) => i !== index));
  };

  const pickMedia = async (mediaTypes: ImagePicker.MediaType[]) => {
    if (selectedFiles.length >= MAX_FILES) {
      showToast({
        type: "error",
        title: "Limit reached",
        message: `You can attach up to ${MAX_FILES} files per post.`
      });
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast({
          type: "error",
          title: "Permission needed",
          message: "Allow photo/video library access in your device settings to attach media."
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: MAX_FILES - selectedFiles.length,
      });

      if (result.canceled) return;

      setSelectedFiles((current) => [...current, ...result.assets].slice(0, MAX_FILES));
    } catch (error) {
      showToast({
        type: "error",
        title: "Couldn't open media library",
        message: error instanceof Error ? error.message : "Please try again."
      });
    }
  };

  const handlePickPhoto = () => pickMedia(["images"]);
  const handlePickVideo = () => pickMedia(["videos"]);
  
  const handleSubmit = async () => {
    const didSucceed = await submit(selectedFiles);
    if (didSucceed) {
      setSelectedFiles([]);
      setShowExtras(false);
      onSuccess?.();
    }
  };

  const content = (
    <CardContent className={`gap-4 ${embedded ? "p-0" : "p-4"}`}>
        <TextInput
          value={values.content}
          onChangeText={(value) => setField("content", value)}
          placeholder="Share an update, milestone, ad, or announcement..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          maxLength={5000}
          className="min-h-[88px] rounded-md border border-input bg-background px-3 py-3 text-base leading-6 text-text"
        />

        {selectedFiles.length > 0 ? (
          <View className="gap-2">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={selectedFiles}
              keyExtractor={(item, index) => `${item.assetId ?? item.uri}-${index}`}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item, index }) => (
                <View className="relative overflow-hidden rounded-md bg-black" style={{ width: 120, height: 160 }}>
                  {item.type === "video" ? (
                    <Video
                      source={{ uri: item.uri }}
                      resizeMode={ResizeMode.COVER}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  )}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove"
                    onPress={() => removeFileAt(index)}
                    className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/60"
                  >
                    <Feather name="x" size={14} color="#fff" />
                  </Pressable>
                </View>
              )}
            />
            <View className="flex-row items-center justify-between">
              <AppText tone="muted" size="xs">
                {selectedFiles.length}/{MAX_FILES} attached
              </AppText>
              <Pressable accessibilityRole="button" onPress={clearMedia}>
                <AppText tone="danger" size="xs" weight="medium">
                  Remove all
                </AppText>
              </Pressable>
            </View>
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
          </View>
        ) : null}
        
        <View>
          <AppText tone="muted" size="xs" weight="medium" className="mb-2">
            Category
          </AppText>
          <CategoryDropdown
            value={values.category}
            options={postCategoryOptions}
            onChange={(value) => setField("category", value)}
            accessibilityLabel="Select post category"
          />
        </View>

        <View className="flex-row flex-wrap items-center gap-2 border-t border-border pt-3">
          <AppButton
            label="Photo"
            variant="ghost"
            size="sm"
            leftIcon={<Feather name="image" size={14} color={colors.muted} />}
            onPress={() => void handlePickPhoto()
            }
          />
          <AppButton
            label="Video"
            variant="ghost"
            size="sm"
            leftIcon={<Feather name="video" size={14} color={colors.muted} />}
            onPress={() => void handlePickVideo()
            }
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
              onPress={() => void handleSubmit()}
            />
          </View>
        </View>
      </CardContent>
  );

  if (embedded) {
    return content;
  }

  return <Card className="mb-5">{content}</Card>;
};
