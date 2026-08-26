import { useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useConversationMessages } from "@/modules/messages/hooks";
import { Message } from "@/modules/messages/types";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

type MessageThreadProps = {
  conversationId: string;
};

type PendingAttachment = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));

const MessageAttachment = ({ message, tint }: { message: Message; tint: "onPrimary" | "default" }) => {
  const colors = useThemeTokens();
  if (!message.attachmentUrl) return null;

  const isImage = message.attachmentType?.startsWith("image/") ?? false;

  if (isImage) {
    return (
      <Pressable accessibilityRole="imagebutton" onPress={() => void Linking.openURL(message.attachmentUrl!)}>
        <Image source={{ uri: message.attachmentUrl }} className="mb-1.5 h-40 w-52 rounded-lg" resizeMode="cover" />
      </Pressable>
    );
  }

  return (
    // Fixed width, not flex-1 on the text: this sits inside a bubble that
    // shrink-wraps to its content (max-w-[78%], no defined width), so a
    // flex-1 child here has no container width to expand into and collapses
    // to zero — which is why the filename never showed, icon-only every time.
    <Pressable
      accessibilityRole="button"
      onPress={() => void Linking.openURL(message.attachmentUrl!)}
      style={{ width: 200 }}
      className={`mb-1.5 flex-row items-center gap-2 rounded-lg p-2.5 ${tint === "onPrimary" ? "bg-white/15" : "bg-background"}`}
    >
      <Feather name="file" size={iconSize.md} color={tint === "onPrimary" ? colors.onPrimary : colors.primary} />
      <AppText size="sm" tone={tint} numberOfLines={1} style={{ flex: 1 }}>
        {message.attachmentName || "Attachment"}
      </AppText>
    </Pressable>
  );
};

export const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  // Tracks the IME's real animation frame (native-driven), not a JS-bridge
  // Keyboard event — this screen sits several flex layers deep inside
  // react-native-screens' fragment-based tab navigation, where both
  // KeyboardAvoidingView and manual Keyboard-event height tracking produced
  // wrong offsets (hidden input, or a gap above the keyboard) depending on
  // whether the OS's own adjustResize happened to be visible to this
  // fragment at the time. useAnimatedKeyboard reads the keyboard's actual
  // on-screen frame directly, so it stays correct either way.
  const keyboard = useAnimatedKeyboard();
  const keyboardPadding = useAnimatedStyle(() => ({ paddingBottom: keyboard.height.value }));
  const scrollRef = useRef<ScrollView>(null);
  const showToast = useToastStore((state) => state.show);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const {
    currentUserId,
    messages,
    isLoading,
    errorMessage,
    draft,
    setDraft,
    submit,
    sendAttachment,
    reload
  } = useConversationMessages(conversationId);

  const pickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPendingAttachment({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size ?? 0
    });
  };

  const handleSend = () => {
    if (pendingAttachment) {
      // Same fire-and-forget shape as a text send: the store shows the
      // attachment optimistically (from the local file URI) the instant
      // it's handed off, so clear the picker chip immediately instead of
      // waiting on the upload — the button was staying in a loading state
      // well after the message already appeared in the thread.
      const attachment = pendingAttachment;
      setPendingAttachment(null);
      void sendAttachment(attachment).then((didSucceed) => {
        if (!didSucceed) {
          showToast({ type: "error", title: "Couldn't send that file", message: "Try again." });
        }
      });
      return;
    }

    void submit();
  };

  return (
    <Animated.View className="min-h-[400px] flex-1 bg-card" style={keyboardPadding}>
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
                    <MessageAttachment message={message} tint="onPrimary" />
                    {message.content ? (
                      <AppText tone="onPrimary" size="sm" className="leading-5">
                        {message.content}
                      </AppText>
                    ) : null}
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
                <MessageAttachment message={message} tint="default" />
                {message.content ? (
                  <AppText size="sm" className="leading-5">
                    {message.content}
                  </AppText>
                ) : null}
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

      {pendingAttachment ? (
        <View className="flex-row items-center gap-2 border-t border-border bg-muted-bg px-4 py-2">
          <Feather name="file" size={iconSize.sm} color={colors.primary} />
          <AppText size="xs" numberOfLines={1} className="flex-1">
            {pendingAttachment.name}
          </AppText>
          <Pressable accessibilityRole="button" onPress={() => setPendingAttachment(null)} hitSlop={8}>
            <Feather name="x" size={16} color={colors.muted} />
          </Pressable>
        </View>
      ) : null}

      <View
        className="flex-row items-center gap-2 border-t border-border bg-card px-4 py-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach a file"
          onPress={() => void pickAttachment()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Feather name="paperclip" size={iconSize.md} color={colors.muted} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message…"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="center"
          maxLength={4000}
          className="max-h-28 min-h-10 flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-5 text-text"
        />
        <AppButton label="Send" size="sm" onPress={() => void handleSend()} />
      </View>
    </Animated.View>
  );
};
