import { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Chat } from "@/modules/chat/types";
import { AuthProfile } from "@/modules/auth/types";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

type ChatRowProps = {
  chat: Chat;
  participant?: AuthProfile | undefined;
  onPress: (id: string) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));

export const ChatRow = memo(({ chat, participant, onPress }: ChatRowProps) => {
  const name = participant?.fullName || "Startuphouze member";
  const headline = participant?.headline || participant?.role || "Conversation";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(chat.id)}
      className="rounded-md border border-border bg-surface p-4 shadow-sm"
    >
      <View className="flex-row gap-3">
        <UserAvatar name={name} imageUrl={participant?.avatarUrl ?? ""} />
        <View className="flex-1">
          <View className="flex-row items-start gap-3">
            <AppText weight="bold" size="lg" className="flex-1 leading-6">
              {name}
            </AppText>
            <AppText tone="muted" size="xs" className="mt-1 text-right">
              {formatDate(chat.lastMessageAt)}
            </AppText>
          </View>
          <AppText tone="primary" size="sm" weight="medium" className="mt-1">
            {headline}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-3">
            {chat.messages?.length ? `${chat.messages.length} messages` : "No messages yet"}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
});

ChatRow.displayName = "ChatRow";
