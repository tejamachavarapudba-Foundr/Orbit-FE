import { useState } from "react";
import { Modal, Pressable, Share, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { chatApi } from "@/modules/chat/api";
import { PeoplePickerModal } from "@/modules/meeting/components/PeoplePickerModal";
import { StartupEvent } from "@/modules/events/types";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

const formatShareText = (event: StartupEvent) => {
  const when = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(event.startsAt));

  return `${event.title}\n${when}\n${event.location}\n\nShared via Orbit`;
};

type EventShareSheetProps = {
  visible: boolean;
  event: StartupEvent;
  onClose: () => void;
};

export const EventShareSheet = ({ visible, event, onClose }: EventShareSheetProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((state) => state.show);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const shareViaSystem = async () => {
    onClose();
    try {
      await Share.share({ message: formatShareText(event) });
    } catch {
      // User dismissed the native share sheet — nothing to do.
    }
  };

  const shareWithPeople = async (peopleIds: string[]) => {
    setIsPickerVisible(false);
    onClose();
    setIsSending(true);

    try {
      const content = formatShareText(event);
      await Promise.all(
        peopleIds.map(async (participantId) => {
          const chat = await chatApi.createChat({ participantId });
          await chatApi.sendMessage({ conversationId: chat.id, content });
        })
      );
      showToast({ type: "success", title: "Event shared" });
    } catch {
      showToast({ type: "error", title: "Couldn't share with everyone", message: "Try again." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

          <Card className="rounded-t-3xl" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center border-b border-border px-5 py-4">
              <AppText size="xl" weight="bold" className="flex-1">
                Share event
              </AppText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View className="gap-1 py-2" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsPickerVisible(true)}
                disabled={isSending}
                className="flex-row items-center gap-3 px-5 py-3.5"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Feather name="users" size={iconSize.md} color={colors.primary} />
                </View>
                <AppText size="base">{isSending ? "Sharing…" : "Share with people on Orbit"}</AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => void shareViaSystem()}
                className="flex-row items-center gap-3 px-5 py-3.5"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Feather name="share-2" size={iconSize.md} color={colors.primary} />
                </View>
                <AppText size="base">Share via...</AppText>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>

      <PeoplePickerModal
        visible={isPickerVisible}
        selectedIds={[]}
        onClose={() => setIsPickerVisible(false)}
        onDone={(ids) => void shareWithPeople(ids)}
      />
    </>
  );
};
