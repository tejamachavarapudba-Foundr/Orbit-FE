import { Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncomingConnectionRequests } from "@/modules/connections/hooks";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";

export const IncomingRequestsSection = () => {
  const { incomingRequests, isLoadingRequests, acceptRequest, declineRequest } = useIncomingConnectionRequests();
  const openUserProfile = useOpenUserProfile();

  if (isLoadingRequests) {
    return (
      <View className="mt-5 gap-3">
        <Skeleton className="h-24 w-full rounded-md" />
      </View>
    );
  }

  if (!incomingRequests.length) {
    return null;
  }

  return (
    <View className="mt-5 rounded-md border border-border bg-surface p-4">
      <AppText weight="bold">Connection requests</AppText>
      <AppText tone="muted" size="sm" className="mt-1">
        {incomingRequests.length} pending
      </AppText>
      <View className="mt-4 gap-3">
        {incomingRequests.map((request) => {
          const requester = request.requester;
          const name = requester?.fullName || "Startuphouze member";

          return (
            <View key={request.id} className="rounded-md border border-border bg-background p-3">
              <Pressable
                accessibilityRole="button"
                disabled={!requester?.id}
                onPress={() => requester?.id && openUserProfile(requester.id)}
                className="flex-row gap-3"
              >
                <UserAvatar name={name} imageUrl={requester?.avatarUrl ?? ""} size={40} />
                <View className="flex-1">
                  <AppText weight="semibold" size="sm">
                    {name}
                  </AppText>
                  <AppText tone="muted" size="xs" className="mt-0.5">
                    {requester?.headline || requester?.role || "Wants to connect"}
                  </AppText>
                </View>
              </Pressable>
              {request.note ? (
                <View className="mt-2 rounded-md bg-surface px-3 py-2">
                  <AppText size="sm" className="leading-5">
                    "{request.note}"
                  </AppText>
                </View>
              ) : null}
              <View className="mt-3 flex-row gap-2">
                <AppButton
                  label="Accept"
                  size="sm"
                  onPress={() => void acceptRequest(request)}
                  className="flex-1 rounded-full"
                />
                <AppButton
                  label="Decline"
                  variant="outline"
                  size="sm"
                  onPress={() => void declineRequest(request)}
                  className="flex-1 rounded-full"
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
