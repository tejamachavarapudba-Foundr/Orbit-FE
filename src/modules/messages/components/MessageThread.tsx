import { useRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const HEADER_HEIGHT = 60;

export const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const {
    currentUserId,
    messages,
    isLoading,
    isSending,
    errorMessage,
    draft,
    setDraft,
    submit,
    reload
  } = useConversationMessages(conversationId);

  return (
    <KeyboardAvoidingView
      className="min-h-[400px] flex-1 bg-card"
      // Android's adjustResize (see AndroidManifest.xml) doesn't reliably
      // propagate through react-native-screens' fragment-based navigation on
      // every device/OS version — the input row can end up hidden behind the
      // keyboard even with adjustResize set. "height" behavior compensates in
      // JS via the Keyboard event listeners instead of depending on the OS to
      // resize the window, so it works regardless.
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? HEADER_HEIGHT + insets.top : 0}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoading ? (
          <View className="gap-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-12 w-2/3 self-end rounded-2xl" />
          </View>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => void reload()} />
        ) : messages.length > 0 ? (
          messages.map((message, index) => {
            const isMine = message.senderId === currentUserId;
            const next = messages[index + 1];
            // LinkedIn only stamps the last bubble in a run from the same sender —
            // collapses a burst of quick messages into one visual group.
            const isLastInGroup = !next || next.senderId !== message.senderId;
            const isLastMineOverall = isMine && messages.slice(index + 1).every((later) => later.senderId !== currentUserId);
            const isSeen = isLastMineOverall && Boolean(message.readAt);

            if (isMine) {
              return (
                <View key={message.id} className="items-end">
                  <View className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2">
                    <AppText tone="onPrimary" size="sm" className="leading-5">
                      {message.content}
                    </AppText>
                    {isLastInGroup ? (
                      <AppText tone="onPrimary" size="xs" className="mt-1 opacity-70">
                        {formatTime(message.createdAt)}
                      </AppText>
                    ) : null}
                  </View>
                  {isSeen ? (
                    <AppText tone="muted" size="xs" className="mt-1 mr-1">
                      Seen
                    </AppText>
                  ) : null}
                </View>
              );
            }

            return (
              <View key={message.id} className="max-w-[78%] self-start rounded-2xl rounded-bl-sm bg-muted-bg px-4 py-2">
                <AppText size="sm" className="leading-5">
                  {message.content}
                </AppText>
                {isLastInGroup ? (
                  <AppText tone="muted" size="xs" className="mt-1">
                    {formatTime(message.createdAt)}
                  </AppText>
                ) : null}
              </View>
            );
          })
        ) : (
          <EmptyState title="No messages yet" message="Say hello to start the conversation." />
        )}
      </ScrollView>

      <View className="flex-row items-end gap-2 border-t border-border bg-card px-4 py-3">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="center"
          maxLength={4000}
          className="max-h-28 min-h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-5 text-text"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={!draft.trim() || isSending}
          onPress={() => void submit()}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary"
        >
          <Feather name="send" size={iconSize.md} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};
