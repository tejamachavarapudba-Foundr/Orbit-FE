import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type MenuAction = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type PostOverflowMenuProps = {
  isOwnPost: boolean;
  onCopyLink: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onNotInterested?: () => void;
  onReport?: () => void;
};

export const PostOverflowMenu = ({ isOwnPost, onCopyLink, onEdit, onDelete, onNotInterested, onReport }: PostOverflowMenuProps) => {
  const colors = useThemeTokens();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  const actions: MenuAction[] = isOwnPost
    ? [
        { label: "Copy link", icon: "link", onPress: () => (close(), onCopyLink()) },
        ...(onEdit ? [{ label: "Edit post", icon: "edit-2" as const, onPress: () => (close(), onEdit()) }] : []),
        ...(onDelete ? [{ label: "Delete post", icon: "trash-2" as const, onPress: () => (close(), onDelete()), destructive: true }] : []),
      ]
    : [
        { label: "Copy link", icon: "link", onPress: () => (close(), onCopyLink()) },
        ...(onNotInterested
          ? [{ label: "Not interested", icon: "eye-off" as const, onPress: () => (close(), onNotInterested()) }]
          : []),
        ...(onReport ? [{ label: "Report post", icon: "flag" as const, onPress: () => (close(), onReport()), destructive: true }] : []),
      ];

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More options"
        onPress={() => setIsOpen(true)}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <Feather name="more-vertical" size={iconSize.md} color={colors.muted} />
      </Pressable>

      {isOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={close}>
          <Pressable accessibilityRole="button" className="flex-1 justify-end bg-black/30" onPress={close}>
            <Pressable className="rounded-t-2xl border border-border bg-surface pb-6 pt-2">
              <View className="mb-2 items-center py-2">
                <View className="h-1 w-10 rounded-full bg-border" />
              </View>
              {actions.map((action) => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  onPress={action.onPress}
                  className="flex-row items-center gap-4 px-6 py-3.5"
                >
                  <Feather name={action.icon} size={20} color={action.destructive ? colors.danger : colors.text} />
                  <AppText size="base" tone={action.destructive ? "danger" : "default"}>
                    {action.label}
                  </AppText>
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
};
