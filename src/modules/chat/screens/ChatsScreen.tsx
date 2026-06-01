import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { UserSkeletonList } from "@/modules/user/components/UserSkeletonList";
import { ChatDetailPanel } from "@/modules/chat/components/ChatDetailPanel";
import { ChatRow } from "@/modules/chat/components/ChatRow";
import { StartChatCard } from "@/modules/chat/components/StartChatCard";
import { getOtherParticipantId, useChats } from "@/modules/chat/hooks";
import { Chat } from "@/modules/chat/types";
import { UserSummary } from "@/modules/user/types";

export const ChatsScreen = () => {
  const {
    currentUserId,
    chats,
    selectedChat,
    startableUsers,
    isLoading,
    isRefreshing,
    isCreating,
    isDetailLoading,
    deletingChatId,
    errorMessage,
    detailErrorMessage,
    loadChats,
    refreshChats,
    startChat,
    selectChat,
    clearSelectedChat,
    deleteChat,
    getParticipant
  } = useChats();

  const renderChat = useCallback<ListRenderItem<Chat>>(
    ({ item }) => <ChatRow chat={item} participant={getParticipant(item)} onPress={(id) => void selectChat(id)} />,
    [getParticipant, selectChat]
  );

  const renderStartableUser = useCallback<ListRenderItem<UserSummary>>(
    ({ item }) => <StartChatCard user={item} isCreating={isCreating} onStart={(user) => void startChat(user)} />,
    [isCreating, startChat]
  );

  const selectedParticipant = selectedChat
    ? getParticipant(selectedChat) ??
      startableUsers.find((user) => user.profile.id === getOtherParticipantId(selectedChat, currentUserId))?.profile
    : undefined;

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChat}
        refreshing={isRefreshing}
        onRefresh={() => void refreshChats()}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="w-full max-w-3xl self-center pt-6">
            <AppText size="2xl" weight="bold">
              Messages
            </AppText>
            <AppText tone="muted" className="mt-2 leading-6">
              Start and manage Startuphouze conversations with founders, engineers, mentors and investors.
            </AppText>

            <ChatDetailPanel
              chat={selectedChat}
              participant={selectedParticipant}
              isLoading={isDetailLoading}
              errorMessage={detailErrorMessage}
              deletingChatId={deletingChatId}
              onClose={clearSelectedChat}
              onDelete={(id) => void deleteChat(id)}
            />

            {startableUsers.length > 0 ? (
              <View className="mt-6">
                <AppText weight="bold" size="lg">
                  Start a chat
                </AppText>
                <FlatList
                  data={startableUsers}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={renderStartableUser}
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                />
              </View>
            ) : null}

            <AppText weight="bold" size="lg" className="mt-6">
              Conversations
            </AppText>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="w-full max-w-3xl self-center">
              <UserSkeletonList />
            </View>
          ) : errorMessage ? (
            <View className="w-full max-w-3xl self-center">
              <ErrorState message={errorMessage} onRetry={() => void loadChats()} />
            </View>
          ) : (
            <View className="w-full max-w-3xl self-center">
              <EmptyState title="No chats yet" message="Start a conversation from the member suggestions above." />
            </View>
          )
        }
      />
    </AppScreen>
  );
};
