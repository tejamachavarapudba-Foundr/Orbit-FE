import { useCallback } from "react";
import { Alert, FlatList, ListRenderItem, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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

export const ArchivedChatsScreen = () => {
  const colors = useThemeTokens();
  const {
    archivedChats,
    selectedChat,
    isLoadingArchived,
    isDetailLoading,
    errorMessage,
    detailErrorMessage,
    loadArchivedChats,
    setArchived,
    selectChat,
    clearSelectedChat,
    getParticipant
  } = useChats();

  const handleLongPress = useCallback(
    (chat: Chat) => {
      const name = getParticipant(chat)?.fullName || "this chat";
      Alert.alert(name, undefined, [
        { text: "Cancel", style: "cancel" },
        { text: "Unarchive", onPress: () => void setArchived(chat.id, false) }
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

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
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
          data={archivedChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <View className="w-full max-w-2xl self-center pb-2">
              <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                Archived
              </AppText>
            </View>
          }
          ListEmptyComponent={
            isLoadingArchived ? (
              <View className="w-full max-w-2xl self-center">
                <UserSkeletonList />
              </View>
            ) : errorMessage ? (
              <View className="w-full max-w-2xl self-center">
                <ErrorState message={errorMessage} onRetry={() => void loadArchivedChats()} />
              </View>
            ) : (
              <View className="w-full max-w-2xl self-center">
                <Card className="overflow-hidden">
                  <View className="items-center px-6 py-10">
                    <Feather name="archive" size={28} color={colors.muted} />
                    <AppText weight="medium" className="mt-3">
                      No archived chats
                    </AppText>
                    <AppText tone="muted" size="sm" className="mt-1 text-center leading-5">
                      Long-press a conversation from Messages to archive it.
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
