import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
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
import { UserSummary } from "@/modules/user/types";
import { iconSize } from "@/theme/designTokens";

export const ChatsScreen = () => {
  const colors = useThemeTokens();
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
      {selectedChat ? (
        <View className="flex-1 px-4 pb-8 pt-4">
          <View className="w-full max-w-2xl self-center">
            <ChatDetailPanel
              chat={selectedChat}
              participant={selectedParticipant}
              isLoading={isDetailLoading}
              errorMessage={detailErrorMessage}
              deletingChatId={deletingChatId}
              onClose={clearSelectedChat}
              onDelete={(id) => void deleteChat(id)}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          refreshing={isRefreshing}
          onRefresh={() => void refreshChats()}
          contentContainerStyle={{ gap: 0, paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <View className="w-full max-w-2xl self-center pb-4 pt-4">
              <View className="mb-1 flex-row items-center gap-2">
                <Feather name="message-square" size={iconSize.lg} color={colors.primary} />
                <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                  Messages
                </AppText>
              </View>
              <AppText tone="muted" size="sm" className="mt-1 leading-5">
                Start a chat from a profile or project page, or pick someone below.
              </AppText>

              {startableUsers.length > 0 ? (
                <View className="mt-6">
                  <AppText weight="semibold" size="sm">
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

              <AppText weight="semibold" size="sm" className="mt-6 mb-3">
                Conversations
              </AppText>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="w-full max-w-2xl self-center px-0">
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
                      Start a chat from anyone&apos;s profile or a project page.
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
