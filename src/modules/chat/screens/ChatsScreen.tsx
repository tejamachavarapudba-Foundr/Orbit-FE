import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Alert, FlatList, ListRenderItem, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { ChatDetailPanel } from "@/modules/chat/components/ChatDetailPanel";
import { ChatRow } from "@/modules/chat/components/ChatRow";
import { useChats } from "@/modules/chat/hooks";
import { Chat } from "@/modules/chat/types";
import { iconSize } from "@/theme/designTokens";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { MainStackParamList } from "@/app/navigation/types";

export const ChatsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

const [search, setSearch] = useState("");

const {
  chats,
  archivedChats,
  selectedChat,
  isLoading,
  isRefreshing,
  isDetailLoading,
  errorMessage,
  detailErrorMessage,
  loadChats,
  refreshChats,
  setArchived,
  selectChat,
  clearSelectedChat,
  getParticipant,
} = useChats();

const filteredChats = useMemo(() => {
  if (!search.trim()) {
    return chats;
  }

  const keyword = search.trim().toLowerCase();

  return chats.filter((chat) => {
    const participant = getParticipant(chat);

    if (!participant) {
    return false;
    }

    return (
      participant?.fullName?.toLowerCase().includes(keyword) ||
      participant?.headline?.toLowerCase().includes(keyword) ||
      participant?.company?.toLowerCase().includes(keyword) ||
      participant.bio?.toLowerCase().includes(keyword) ||
      participant.location?.toLowerCase().includes(keyword)
    );
  });
}, [search, chats, getParticipant]);

  const handleLongPress = useCallback(
    (chat: Chat) => {
      const name = getParticipant(chat)?.fullName || "this chat";
      Alert.alert(name, undefined, [
        { text: "Cancel", style: "cancel" },
        { text: "Archive", onPress: () => void setArchived(chat.id, true) }
      ]);
    },
    [getParticipant, setArchived]
  );

  const renderChat = useCallback<ListRenderItem<Chat>>(
    ({ item }) => (
    <ChatRow
      chat={item}
      participant={getParticipant(item)}
      onPress={(id) => void selectChat(id)}
      onLongPress={handleLongPress}
      />
    ),
    [getParticipant, selectChat, handleLongPress]
  );

  const selectedParticipant = selectedChat ? getParticipant(selectedChat) : undefined;

  // An open conversation takes the full screen, like a real messaging app —
  // hide the app chrome (top bar, bottom tabs) instead of showing them
  // alongside the thread. Reset to undefined (not the same style object,
  // since another screen may render before this cleanup runs) when the
  // chat is closed so the shared tab bar options apply again.
  // useLayoutEffect, not useEffect: this must land before the screen paints
  // and before the keyboard can open. A post-paint update left a window
  // where the tab bar was still reserving its height while the keyboard
  // opened, so the animated keyboard-offset math in MessageThread ran
  // against a stale screen height and pushed the input box off-screen.
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedChat ? { display: "none" } : undefined
    } as never);
  }, [navigation, selectedChat]);

    const listHeader = (
      <View className="w-full max-w-2xl self-center pb-2 pt-4">
    
        <View className="mb-1 flex-row items-center gap-2">
          <Feather
            name="message-square"
            size={iconSize.lg}
            color={colors.primary}
          />
    
          <AppText
            family="display"
            size="2xl"
            weight="bold"
            className="tracking-tight"
          >
            Messages
          </AppText>
        </View>
    
        <View className="mt-4">
          <AppTextInput
            label="Search"
            placeholder="Search conversations..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("ArchivedChats")}
          className="mt-4 flex-row items-center gap-3 border-b border-border py-3 active:bg-muted-bg"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-muted-bg">
            <Feather name="archive" size={iconSize.md} color={colors.muted} />
          </View>
          <AppText weight="medium" className="flex-1">
            Archived
          </AppText>
          {archivedChats.length > 0 ? (
            <AppText tone="muted" size="sm">
              {archivedChats.length}
            </AppText>
          ) : null}
          <Feather name="chevron-right" size={iconSize.sm} color={colors.muted} />
        </Pressable>
    </View>
  );

  return (
    <AppScreen withHorizontalPadding={false}>
      {selectedChat ? null : <AppHeader />}
      {selectedChat ? (
        <View className="flex-1">
          <ChatDetailPanel
            chat={selectedChat}
            participant={selectedParticipant}
            isLoading={isDetailLoading}
            errorMessage={detailErrorMessage}
            onClose={clearSelectedChat}
          />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          refreshing={isRefreshing}
          onRefresh={() => void refreshChats()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            isLoading ? (
              <View className="w-full max-w-2xl self-center">
                <UserSkeletonList />
              </View>
            ) : errorMessage ? (
              <View className="w-full max-w-2xl self-center">
                <ErrorState message={errorMessage} onRetry={() => void loadChats()} />
              </View>
            ) : (
              <View className="w-full max-w-2xl self-center">
                <Card className="overflow-hidden">
                  <View className="items-center px-6 py-10">
                    <Feather name="message-square" size={28} color={colors.muted} />
                    <AppText weight="medium" className="mt-3">
                      No conversations yet
                    </AppText>
                    <AppText tone="muted" size="sm" className="mt-1 text-center leading-5">
                      Follow members on Network, then message them from their profile.
                    </AppText>
                  </View>
                </Card>
              </View>
            )
          }
        />
      )}
    </AppScreen>
  );
};
