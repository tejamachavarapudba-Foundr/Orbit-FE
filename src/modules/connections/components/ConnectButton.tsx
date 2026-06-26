import { memo } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { ConnectionRequestModal } from "@/modules/connections/components/ConnectionRequestModal";
import { useConnectionAction } from "@/modules/connections/hooks";
import { FollowProfile } from "@/modules/follows/types";

type ConnectButtonProps = {
  profile: FollowProfile;
  compact?: boolean;
};

export const ConnectButton = memo(({ profile, compact = false }: ConnectButtonProps) => {
  const {
    isSelf,
    status,
    isStatusLoading,
    isMutating,
    isModalOpen,
    openConnectModal,
    closeConnectModal,
    submitConnectNote,
    acceptIncoming,
    declineIncoming,
    cancelOutgoing
  } = useConnectionAction(profile);

  if (isSelf) {
    return null;
  }

  const rowClass = compact ? "mt-4 h-10 self-start px-5" : "h-11 w-full";

  // 🟢 FIX: Matches backend value "incoming_pending" exactly
  if (status === "incoming_pending") {
    return (
      <View className={compact ? "mt-4 flex-row gap-2" : "flex-row gap-2 w-full justify-between"}>
        <AppButton label="Accept" loading={isMutating} onPress={() => void acceptIncoming()} className="flex-1 h-11" />
        <AppButton label="Decline" variant="outline" loading={isMutating} onPress={() => void declineIncoming()} className="flex-1 h-11" />
      </View>
    );
  }

  // 🟢 FIX: Matches backend value "outgoing_pending" exactly
  if (status === "outgoing_pending") {
    return (
      <AppButton
        label="Cancel Request" // Changed from "Pending" to visually represent the action
        variant="outline"
        loading={isMutating}
        onPress={() => void cancelOutgoing()}
        className={rowClass}
      />
    );
  }

  if (status === "connected") {
    return <AppButton label="Connected" variant="outline" disabled className={rowClass} />;
  }

  return (
    <>
      <AppButton
        label="Connect"
        loading={isStatusLoading || isMutating}
        onPress={openConnectModal}
        className={rowClass}
      />
      <ConnectionRequestModal
        visible={isModalOpen}
        recipientName={profile.fullName || "this member"}
        isSubmitting={isMutating}
        onClose={closeConnectModal}
        onSubmit={submitConnectNote}
      />
    </>
  );
});

ConnectButton.displayName = "ConnectButton";
