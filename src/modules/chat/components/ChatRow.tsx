import { memo, useMemo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Chat } from "@/modules/chat/types";
import { AuthProfile } from "@/modules/auth/types";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/modules/auth/store";

type ChatRowProps = {
  chat: Chat;
  participant?: AuthProfile | undefined;
  onPress: (id: string) => void;
  onLongPress?: (chat: Chat) => void;
};

const formatRelativeTime = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date));
};

const getLatestMessage = (chat: Chat) => {
  const messages = chat.messages?.filter((message) => message.content?.trim()) ?? [];
  if (messages.length === 0) return null;

  return [...messages].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  })[0]!;
};

export const ChatRow = memo(({ chat, participant, onPress, onLongPress }: ChatRowProps) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const name = participant?.fullName || "Orbit member";
  const latest = useMemo(() => getLatestMessage(chat), [chat]);
  const preview = latest?.content?.trim() || "Start the conversation...";
  const isUnread = Boolean(latest && latest.senderId !== currentUserId && !latest.readAt);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(chat.id)}
      onLongPress={onLongPress ? () => onLongPress(chat) : undefined}
      className="flex-row items-center gap-3 border-b border-border px-1 py-3 active:bg-muted-bg"
    >
      <Avatar name={name} imageUrl={participant?.avatarUrl ?? ""} size="md" fallback="mesh" />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <AppText weight={isUnread ? "bold" : "medium"} numberOfLines={1} className="flex-1">
            {name}
          </AppText>
          <AppText tone={isUnread ? "primary" : "muted"} weight={isUnread ? "semibold" : "regular"} size="xs">
            {formatRelativeTime(chat.lastMessageAt)}
          </AppText>
        </View>
        <View className="mt-1 flex-row items-center gap-2">
          <AppText
            tone={isUnread ? "default" : "muted"}
            weight={isUnread ? "medium" : "regular"}
            size="sm"
            numberOfLines={1}
            className="flex-1"
          >
            {preview}
          </AppText>
          {isUnread ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
        </View>
      </View>
    </Pressable>
  );
});

ChatRow.displayName = "ChatRow";
