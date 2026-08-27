import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { userApi } from "@/modules/user/api";
import { iconSize } from "@/theme/designTokens";

type PersonOption = { id: string; fullName: string; headline: string; avatarUrl: string };

type PeoplePickerModalProps = {
  visible: boolean;
  selectedIds: string[];
  onClose: () => void;
  onDone: (ids: string[], people: PersonOption[]) => void;
};

export const PeoplePickerModal = ({ visible, selectedIds, onClose, onDone }: PeoplePickerModalProps) => {
  const colors = useThemeTokens();
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [picked, setPicked] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!visible) return;
    setPicked(selectedIds);
    userApi.getUsers().then((users) =>
      setPeople(
        users
          .filter((u) => u.id !== currentUserId)
          .map((u) => ({ id: u.id, fullName: u.profile.fullName, headline: u.profile.headline, avatarUrl: u.profile.avatarUrl }))
      )
    );
  }, [visible, selectedIds, currentUserId]);

  const filtered = useMemo(
    () => people.filter((p) => p.fullName.toLowerCase().includes(query.trim().toLowerCase())),
    [people, query]
  );

  const toggle = (id: string) => {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityRole="button" className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" onPress={onClose} />
        <View className="max-h-[80%] rounded-t-2xl bg-card p-4">
          <View className="flex-row items-center justify-between">
            <AppText weight="bold" size="lg">
              Invite people
            </AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Feather name="x" size={iconSize.lg} color={colors.text} />
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name..."
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            className="mt-4 h-11 rounded-md border border-input bg-background px-3 text-sm text-text"
          />

          <ScrollView className="mt-3" keyboardShouldPersistTaps="handled">
            {filtered.map((person) => {
              const isSelected = picked.includes(person.id);
              return (
                <Pressable
                  key={person.id}
                  accessibilityRole="button"
                  onPress={() => toggle(person.id)}
                  className="flex-row items-center justify-between border-b border-border py-3"
                >
                  <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-3">
                    <Avatar name={person.fullName} imageUrl={person.avatarUrl} size="sm" fallback="mesh" />
                    <View className="min-w-0 flex-1">
                      <AppText weight="medium" numberOfLines={1}>
                        {person.fullName}
                      </AppText>
                      {person.headline ? (
                        <AppText tone="muted" size="xs" numberOfLines={1} className="mt-0.5">
                          {person.headline}
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                  <Feather
                    name={isSelected ? "check-circle" : "circle"}
                    size={iconSize.lg}
                    color={isSelected ? colors.primary : colors.muted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <AppButton
            label={`Done${picked.length ? ` (${picked.length})` : ""}`}
            className="mt-4"
            onPress={() => onDone(picked, people.filter((p) => picked.includes(p.id)))}
          />
        </View>
      </View>
    </Modal>
  );
};
