import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncomingConnectionRequests } from "@/modules/connections/hooks";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

export const IncomingRequestsSection = () => {
  const { incomingRequests, isLoadingRequests, acceptRequest, declineRequest } = useIncomingConnectionRequests();

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
            <View key={request.id} className="rounded-md border border-border bg-background p-4">
              <View className="flex-row gap-3">
                <UserAvatar name={name} imageUrl={requester?.avatarUrl ?? ""} />
                <View className="flex-1">
                  <AppText weight="semibold">{name}</AppText>
                  <AppText tone="muted" size="sm" className="mt-1">
                    {requester?.headline || requester?.role || "Wants to connect"}
                  </AppText>
                </View>
              </View>
              {request.note ? (
                <View className="mt-3 rounded-md bg-surface px-3 py-2">
                  <AppText size="sm" className="leading-5">
                    "{request.note}"
                  </AppText>
                </View>
              ) : null}
              <View className="mt-3 flex-row gap-2">
                <AppButton label="Accept" onPress={() => void acceptRequest(request)} className="flex-1" />
                <AppButton label="Decline" variant="outline" onPress={() => void declineRequest(request)} className="flex-1" />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
