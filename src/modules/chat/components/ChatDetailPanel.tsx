import { Alert, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { AuthProfile } from "@/modules/auth/types";
import { Chat } from "@/modules/chat/types";
import { MessageThread } from "@/modules/messages/components/MessageThread";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

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
  if (isLoading) {
    return (
      <View className="mt-5 rounded-md border border-border bg-surface p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-20 w-full" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="mt-5 rounded-md border border-border bg-surface p-4">
        <ErrorState message={errorMessage} />
      </View>
    );
  }

  if (!chat) {
    return null;
  }

  const participantName = participant?.fullName || "Startuphouze member";
  const isDeleting = deletingChatId === chat.id;

  return (
    <View className="mt-5 rounded-md border border-border bg-surface p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <UserAvatar name={participantName} imageUrl={participant?.avatarUrl ?? ""} />
        <View className="flex-1">
          <AppText weight="bold" size="lg">
            {participantName}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            Chat ID: {chat.id}
          </AppText>
        </View>
        <AppButton label="Close" variant="ghost" onPress={onClose} className="h-10 px-3" />
      </View>

      <MessageThread conversationId={chat.id} />

      <AppButton
        label="Delete chat"
        variant="outline"
        loading={isDeleting}
        onPress={() =>
          Alert.alert("Delete chat", "This conversation will be removed from your chat list.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(chat.id) }
          ])
        }
        className="mt-4"
      />
    </View>
  );
};
