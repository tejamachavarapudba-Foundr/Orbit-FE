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

  if (status === "pending_incoming") {
    return (
      <View className={compact ? "mt-4 gap-2" : "gap-2"}>
        <AppButton label="Accept" loading={isMutating} onPress={() => void acceptIncoming()} className={rowClass} />
        <AppButton label="Decline" variant="outline" loading={isMutating} onPress={() => void declineIncoming()} className={rowClass} />
      </View>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <AppButton
        label="Pending"
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
