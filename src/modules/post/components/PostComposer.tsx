import { useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { postCategoryOptions, usePostComposer } from "@/modules/post/hooks";

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
  const clearMedia = () => {
    setSelectedFiles([]);
  };
  
  const handlePickPhoto = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
  
    if (result.canceled) return;
  
    setSelectedFiles(result.assets);
  };

  const handlePickVideo = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
      });
  
    if (result.canceled) return;
  
    setSelectedFiles(result.assets);
  };
  
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

        {selectedFiles.length > 0 ?  (
          <View className="relative border border-red-500 p-2">
            <AppText>IMAGE FOUND</AppText>

            <Image
              source={{ uri: selectedFiles[0]?.uri }}
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
