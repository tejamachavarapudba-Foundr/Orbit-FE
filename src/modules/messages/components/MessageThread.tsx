import { Alert, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useConversationMessages } from "@/modules/messages/hooks";
import { iconSize } from "@/theme/designTokens";

type MessageThreadProps = {
  conversationId: string;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
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
    <View className="min-h-[360px] flex-1 bg-card">
      <View className="flex-1 px-4 py-4">
        {isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-12 w-2/3 self-end rounded-2xl" />
          </View>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void reload()} />
        ) : messages.length > 0 ? (
          <View className="gap-3">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              const isDeleting = deletingMessageId === message.id;

              if (isMine) {
                return (
                  <View key={message.id} className="max-w-[82%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2">
                    <AppText tone="onPrimary" size="sm" className="leading-5">
                      {message.content}
                    </AppText>
                    <View className="mt-1 flex-row items-center justify-end gap-2">
                      <AppText tone="onPrimary" size="xs" className="opacity-80">
                        {formatTime(message.createdAt)}
                        {message.readAt ? " · Read" : ""}
                      </AppText>
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
                        <Feather name="trash-2" size={12} color={colors.onPrimary} />
                      </Pressable>
                    </View>
                  </View>
                );
              }

              return (
                <View key={message.id} className="max-w-[82%] self-start rounded-2xl rounded-bl-sm bg-muted-bg px-4 py-2">
                  <AppText size="sm" className="leading-5">
                    {message.content}
                  </AppText>
                  <AppText tone="muted" size="xs" className="mt-1">
                    {formatTime(message.createdAt)}
                  </AppText>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState title="No messages yet" message="Say hello to start the conversation." />
        )}
      </View>

      <View className="flex-row items-end gap-2 border-t border-border bg-card px-3 py-3">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          maxLength={4000}
          className="max-h-28 min-h-10 flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-5 text-text"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={!draft.trim() || isSending}
          onPress={() => void submit()}
          className="h-10 w-10 items-center justify-center rounded-md bg-primary"
        >
          <Feather name="send" size={iconSize.md} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
};
