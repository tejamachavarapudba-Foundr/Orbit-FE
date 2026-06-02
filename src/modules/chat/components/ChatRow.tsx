import { memo, useMemo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Chat } from "@/modules/chat/types";
import { AuthProfile } from "@/modules/auth/types";
import { Avatar } from "@/components/ui/Avatar";

type ChatRowProps = {
  chat: Chat;
  participant?: AuthProfile | undefined;
  onPress: (id: string) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(date));

const getPreview = (chat: Chat) => {
  const messages = chat.messages?.filter((message) => message.content?.trim()) ?? [];
  if (messages.length === 0) {
    return "Start the conversation...";
  }

  const latest = [...messages].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  })[0];

  return latest?.content?.trim() || "Start the conversation...";
};

export const ChatRow = memo(({ chat, participant, onPress }: ChatRowProps) => {
  const name = participant?.fullName || "Foundr member";
  const preview = useMemo(() => getPreview(chat), [chat]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(chat.id)}
      className="mb-3 overflow-hidden rounded-xl border border-border bg-card px-4 py-4 active:bg-muted-bg"
    >
      <View className="flex-row items-center gap-3">
        <Avatar name={name} imageUrl={participant?.avatarUrl ?? ""} size="md" fallback="mesh" />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <AppText weight="medium" numberOfLines={1} className="flex-1">
              {name}
            </AppText>
            <AppText tone="muted" size="xs">
              {formatDate(chat.lastMessageAt)}
            </AppText>
          </View>
          <AppText tone="muted" size="sm" numberOfLines={1} className="mt-1">
            {preview}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
});

ChatRow.displayName = "ChatRow";
