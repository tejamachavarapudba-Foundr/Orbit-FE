import { Pressable, Text, View } from "react-native";

import { Profile } from "@/modules/profile/types";
import { AuthProfile } from "@/modules/auth/types";

type ResumeCardProps = {
  profile: AuthProfile | undefined;
  onUpload: () => void;
  onReplace: () => void;
  onDelete: () => void;
  isUploading?: boolean;
};

const formatFileSize = (size?: number) => {
  if (!size) return "";

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date?: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString();
};

export const ResumeCard = ({
  profile,
  onUpload,
  onReplace,
  onDelete,
  isUploading = false,
}: ResumeCardProps) => {
  const hasResume = Boolean(profile?.resumeKey);

  return (
    <View className="rounded-2xl border border-border bg-card p-4 mt-5">

      <Text className="text-lg font-semibold text-foreground">
        Resume
      </Text>

      {!hasResume ? (
        <>
          <Text className="mt-2 text-muted-foreground">
            No resume uploaded
          </Text>

          <Pressable
            className="mt-4 rounded-xl bg-primary px-4 py-3"
            disabled={isUploading}
            onPress={onUpload}
          >
            <Text className="text-center font-semibold text-white">
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className="mt-3 text-base font-medium">
            📄 {profile?.resumeFileName}
          </Text>

          <Text className="mt-1 text-muted-foreground">
            {formatFileSize(profile?.resumeFileSize)}
          </Text>

          <Text className="mt-1 text-muted-foreground">
            Updated {formatDate(profile?.resumeUpdatedAt ?? "")}
          </Text>

          <View className="mt-5 flex-row">

            <Pressable
              onPress={onReplace}
              disabled={isUploading}
              className="mr-3 rounded-xl bg-primary px-4 py-2"
            >
              <Text className="font-medium text-white">
                Replace
              </Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              className="rounded-xl border border-red-500 px-4 py-2"
            >
              <Text className="font-medium text-red-500">
                Delete
              </Text>
            </Pressable>

          </View>
        </>
      )}

    </View>
  );
};