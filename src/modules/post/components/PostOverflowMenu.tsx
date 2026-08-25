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
  isSaved: boolean;
  onToggleSave: () => void;
  isOwnPost: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const PostOverflowMenu = ({ isSaved, onToggleSave, isOwnPost, onEdit, onDelete }: PostOverflowMenuProps) => {
  const colors = useThemeTokens();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  const actions: MenuAction[] = [
    { label: isSaved ? "Remove from saved" : "Save", icon: "bookmark", onPress: () => (close(), onToggleSave()) },
    ...(isOwnPost && onEdit ? [{ label: "Edit post", icon: "edit-2" as const, onPress: () => (close(), onEdit()) }] : []),
    ...(isOwnPost && onDelete
      ? [{ label: "Delete post", icon: "trash-2" as const, onPress: () => (close(), onDelete()), destructive: true }]
      : []),
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
