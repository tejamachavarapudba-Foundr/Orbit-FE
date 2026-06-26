import { useEffect, useCallback } from "react";
import { FlatList, View, ActivityIndicator } from "react-native";
import { useConnectionsStore } from "@/modules/connections/store";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

export const InvitationsScreen = () => {
  const incomingRequests = useConnectionsStore((state) => state.incomingRequests);
  const isLoading = useConnectionsStore((state) => state.isLoadingRequests);
  const loadIncomingRequests = useConnectionsStore((state) => state.loadIncomingRequests);
  const acceptRequest = useConnectionsStore((state) => state.acceptRequest);
  const declineRequest = useConnectionsStore((state) => state.declineRequest);
  const isMutatingByUserId = useConnectionsStore((state) => state.isMutatingByUserId);

  // Fetch the latest pending invitations from NestJS when screen mounts
  useEffect(() => {
    void loadIncomingRequests();
  }, [loadIncomingRequests]);

  const renderInvitation = useCallback(({ item }: { item: any }) => {
    // Gracefully handle your normalized requester payload fallback structure
    const requester = item.requester;
    const isProcessing = isMutatingByUserId[item.requesterId] || false;

    if (!requester) return null;

    return (
      <Card className="mb-3 p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <UserAvatar src={requester.avatarUrl} name={requester.fullName} size="md" />
          <View className="ml-3 flex-1">
            <AppText weight="bold" size="base">{requester.fullName}</AppText>
            <AppText tone="muted" size="sm" numberOfLines={1}>{requester.headline || "Member"}</AppText>
            {item.note ? (
              <View className="mt-1.5 bg-muted/30 p-2 rounded">
                <AppText size="xs" tone="secondary">"{item.note}"</AppText>
              </View>
            ) : null}
          </View>
        </View>

        {/* Accept and Decline Interaction Blocks */}
        <View className="flex-row gap-2">
          <AppButton 
            label="Decline" 
            variant="outline" 
            disabled={isProcessing} 
            onPress={() => void declineRequest(item)}
          />
          <AppButton 
            label="Accept" 
            loading={isProcessing} 
            onPress={() => void acceptRequest(item)}
          />
        </View>
      </Card>
    );
  }, [isMutatingByUserId, acceptRequest, declineRequest]);

  if (isLoading && incomingRequests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-background">
      <AppText size="xl" weight="bold" className="mb-4">
        Connection Requests ({incomingRequests.length})
      </AppText>

      <FlatList
        data={incomingRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderInvitation}
        refreshing={isLoading}
        onRefresh={() => void loadIncomingRequests()}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <AppText tone="muted">No pending connection invitations.</AppText>
          </View>
        }
      />
    </View>
  );
};
