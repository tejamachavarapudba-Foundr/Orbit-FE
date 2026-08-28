import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { AuthProfile } from "@/modules/auth/types";
import { Chat } from "@/modules/chat/types";
import { MessageThread } from "@/modules/messages/components/MessageThread";
import { Avatar } from "@/components/ui/Avatar";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";
import { iconSize } from "@/theme/designTokens";

type ChatDetailPanelProps = {
  chat: Chat | null;
  participant?: AuthProfile | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
};

export const ChatDetailPanel = ({
  chat,
  participant,
  isLoading,
  errorMessage,
  onClose
}: ChatDetailPanelProps) => {
  const colors = useThemeTokens();
  const openUserProfile = useOpenUserProfile();

  if (isLoading) {
    return (
      <View className="flex-1 bg-card p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-20 w-full" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 bg-card p-4">
        <ErrorState message={errorMessage} />
      </View>
    );
  }

  if (!chat) {
    return null;
  }

  const participantName = participant?.fullName || "Startuphouze member";

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border bg-card px-3 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to conversations"
          onPress={onClose}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.lg} color={colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => participant?.id && openUserProfile(participant.id)}
          className="min-w-0 flex-1 flex-row items-center gap-2"
        >
          <Avatar name={participantName} imageUrl={participant?.avatarUrl ?? ""} size="sm" fallback="mesh" />
          <View className="min-w-0 flex-1">
            <AppText weight="medium" numberOfLines={1}>
              {participantName}
            </AppText>
            {participant?.headline ? (
              <AppText tone="muted" size="xs" numberOfLines={1}>
                {participant.headline}
              </AppText>
            ) : null}
          </View>
        </Pressable>
      </View>

      <MessageThread conversationId={chat.id} />
    </View>
  );
};
