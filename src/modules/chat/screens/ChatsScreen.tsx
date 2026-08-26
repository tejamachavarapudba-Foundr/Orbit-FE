import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItem, ScrollView, View } from "react-native";
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
import { StartChatCard } from "@/modules/chat/components/StartChatCard";
import { getOtherParticipantId, useChats } from "@/modules/chat/hooks";
import { Chat } from "@/modules/chat/types";
import { iconSize } from "@/theme/designTokens";
import { AppTextInput } from "@/components/ui/AppTextInput";

export const ChatsScreen = () => {
  const colors = useThemeTokens();

const [search, setSearch] = useState("");

const {
  currentUserId,
  chats,
  selectedChat,
  startableUsers,
  isLoading,
  isRefreshing,
  isCreating,
  isDetailLoading,
  errorMessage,
  detailErrorMessage,
  loadChats,
  refreshChats,
  startChat,
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

  const renderChat = useCallback<ListRenderItem<Chat>>(
    ({ item }) => (
    <ChatRow 
      chat={item}
      participant={getParticipant(item)}
      onPress={(id) => void selectChat(id)}
      />
    ),
    [getParticipant, selectChat]
  );

  const selectedParticipant = selectedChat
    ? getParticipant(selectedChat) ??
      startableUsers.find((user) => user.profile.id === getOtherParticipantId(selectedChat, currentUserId))?.profile
    : undefined;

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
    
        {startableUsers.length > 0 ? (
        <View className="mt-5">
          <AppText weight="semibold" size="sm">
            Start a chat
          </AppText>
          <AppText tone="muted" size="xs" className="mt-1">
            You can message people you are connected with.
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row">
              {startableUsers.map((user) => (
                <StartChatCard
                  key={user.id}
                  user={user}
                  isCreating={isCreating}
                  onStart={(target) => void startChat(target)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

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
                      Follow members on Network, then start a chat here.
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
