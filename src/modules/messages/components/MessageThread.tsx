import { Alert, Pressable, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useConversationMessages } from "@/modules/messages/hooks";

type MessageThreadProps = {
  conversationId: string;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));

export const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const colors = useThemeTokens();
  const {
    currentUserId,
    messages,
    isLoading,
    isSending,
    deletingMessageId,
    errorMessage,
    draft,
    setDraft,
    submit,
    deleteMessage,
    reload
  } = useConversationMessages(conversationId);

  return (
    <View className="mt-5 rounded-md bg-background p-4">
      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <Skeleton className="h-12 w-2/3 self-end rounded-md" />
        </View>
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => void reload()} />
      ) : messages.length > 0 ? (
        <View className="gap-3">
          {messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            const isDeleting = deletingMessageId === message.id;

            return (
              <View
                key={message.id}
                className={`max-w-[86%] rounded-md px-4 py-3 ${isMine ? "self-end bg-primary" : "self-start bg-surface"}`}
              >
                <AppText tone={isMine ? "onPrimary" : "default"}>{message.content}</AppText>
                <View className="mt-2 flex-row items-center gap-3">
                  <AppText tone={isMine ? "onPrimary" : "muted"} size="xs">
                    {formatTime(message.createdAt)}
                    {isMine && message.readAt ? " | Read" : ""}
                  </AppText>
                  {isMine ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isDeleting}
                      onPress={() =>
                        Alert.alert("Delete message", "Remove this message from the conversation?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => void deleteMessage(message.id) }
                        ])
                      }
                    >
                      <AppText tone={isMine ? "onPrimary" : "danger"} size="xs" weight="semibold">
                        {isDeleting ? "Deleting" : "Delete"}
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState title="No messages yet" message="Send the first message to start the conversation." />
      )}

      <View className="mt-4 flex-row items-end gap-3 border-t border-border pt-4">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          className="min-h-14 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-base text-text"
        />
        <AppButton label="Send" loading={isSending} disabled={!draft.trim()} onPress={() => void submit()} className="h-14 px-5" />
      </View>
    </View>
  );
};
