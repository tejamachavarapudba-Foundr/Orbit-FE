import { useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUploadMedia } from "@/modules/media/hooks";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { postCategoryOptions, usePostComposer } from "@/modules/post/hooks";
import { PostMediaType } from "@/modules/post/types";

export const PostComposer = () => {
  const colors = useThemeTokens();
  const { values, isSubmitting, setField, submit, canSubmit } = usePostComposer();
  const [showExtras, setShowExtras] = useState(false);
  const uploadMedia = useUploadMedia();
  const clearMedia = () => {
    setField("imageUrl", "");
    setField("mediaType", "none" as PostMediaType);
  };
  
  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
  
    if (result.canceled) {
      return;
    }
  
    try {
      const upload = await uploadMedia.mutateAsync({
        uri: result.assets[0].uri,
        kind: "post",
      });
  
      console.log("UPLOAD RESPONSE:", upload);
      console.log("CURRENT IMAGE URL:", values.imageUrl);
      setField("imageUrl", result.assets[0].uri);
      console.log("LOCAL URI:", result.assets[0].uri);
      setField("mediaType", "image" as PostMediaType);
      
    } catch (error) {
      console.error(error);
    }
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
    });
  
    if (result.canceled) return;
  
    try {
      const upload = await uploadMedia.mutateAsync({
        uri: result.assets[0].uri,
        kind: "post",
      });
  
      setField("imageUrl", upload.url);
      setField("mediaType", "video" as PostMediaType);
    } catch (error) {
      console.error("Video upload failed:", error);
    }
  };
  
  console.log("CURRENT IMAGE URL:", values.imageUrl);

  return (
    <Card className="mb-5">
      <CardContent className="gap-4 p-4">
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

        {values.imageUrl ? (
          <View className="relative border border-red-500 p-2">
            <AppText>IMAGE FOUND</AppText>

            <Image
              source={{ uri: values.imageUrl }}
              style={{
                width: 300,
               height: 200,
              }}
              resizeMode="cover"
            />

            <Pressable
              accessibilityRole="button"
              onPress={clearMedia}
              className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-md border border-border bg-card"
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
              onPress={() => void submit()}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
