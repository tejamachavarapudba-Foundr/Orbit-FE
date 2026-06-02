import { Alert, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
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
      <Card className="p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-20 w-full" />
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="p-4">
        <ErrorState message={errorMessage} />
      </Card>
    );
  }

  if (!chat) {
    return null;
  }

  const participantName = participant?.fullName || "Foundr member";
  const participantHeadline = participant?.headline || participant?.role || "Community member";
  const isDeleting = deletingChatId === chat.id;

  return (
    <View className="flex-1">
      <View className="mb-3 flex-row items-center gap-2 border-b border-border bg-card px-3 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to conversations"
          onPress={onClose}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <Avatar name={participantName} imageUrl={participant?.avatarUrl ?? ""} size="sm" fallback="mesh" />
        <View className="min-w-0 flex-1">
          <AppText weight="medium" numberOfLines={1}>
            {participantName}
          </AppText>
          <AppText tone="muted" size="xs" numberOfLines={1}>
            {participantHeadline}
          </AppText>
        </View>
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

      <Card className="flex-1 overflow-hidden">
        <MessageThread conversationId={chat.id} />
      </Card>
    </View>
  );
};
