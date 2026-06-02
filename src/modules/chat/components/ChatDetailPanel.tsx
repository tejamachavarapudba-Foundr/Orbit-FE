import { Alert, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { AuthProfile } from "@/modules/auth/types";
import { Chat } from "@/modules/chat/types";
import { MessageThread } from "@/modules/messages/components/MessageThread";
import { Avatar } from "@/components/ui/Avatar";
import { iconSize } from "@/theme/designTokens";

type ChatDetailPanelProps = {
  chat: Chat | null;
  participant?: AuthProfile | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  deletingChatId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export const ChatDetailPanel = ({
  chat,
  participant,
  isLoading,
  errorMessage,
  deletingChatId,
  onClose,
  onDelete
}: ChatDetailPanelProps) => {
  const colors = useThemeTokens();

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

  const participantName = participant?.fullName || "Foundr member";
  const isDeleting = deletingChatId === chat.id;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border bg-card px-3 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to conversations"
          onPress={onClose}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <Avatar name={participantName} imageUrl={participant?.avatarUrl ?? ""} size="sm" fallback="mesh" />
        <AppText weight="medium" numberOfLines={1} className="min-w-0 flex-1">
          {participantName}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete conversation"
          disabled={isDeleting}
          onPress={() =>
            Alert.alert("Delete chat", "This conversation will be removed from your chat list.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDelete(chat.id) }
            ])
          }
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
        </Pressable>
      </View>

      <MessageThread conversationId={chat.id} />
    </View>
  );
};
