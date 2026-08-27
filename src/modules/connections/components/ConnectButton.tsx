import { memo } from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ConnectionRequestModal } from "@/modules/connections/components/ConnectionRequestModal";
import { useConnectionAction } from "@/modules/connections/hooks";
import { FollowProfile } from "@/modules/follows/types";
import { iconSize } from "@/theme/designTokens";

type ConnectButtonProps = {
  profile: FollowProfile;
  compact?: boolean;
};

// Small round icon button used on cramped card layouts (Discover) instead
// of the full-width labeled button — same connection actions, just an icon.
const CompactConnectButton = ({
  status,
  isLoading,
  onConnect,
  onAccept,
  onDecline,
  onCancel
}: {
  status: string;
  isLoading: boolean;
  onConnect: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
}) => {
  const colors = useThemeTokens();

  if (status === "incoming_pending") {
    return (
      <View className="flex-row gap-2">
        <AppButton
          label="Accept"
          size="icon"
          loading={isLoading}
          onPress={onAccept}
          leftIcon={<Feather name="check" size={iconSize.sm} color={colors.onPrimary} />}
          className="h-9 w-9 rounded-full"
        />
        <AppButton
          label="Decline"
          variant="outline"
          size="icon"
          loading={isLoading}
          onPress={onDecline}
          leftIcon={<Feather name="x" size={iconSize.sm} color={colors.primary} />}
          className="h-9 w-9 rounded-full"
        />
      </View>
    );
  }

  if (status === "outgoing_pending") {
    return (
      <AppButton
        label="Cancel request"
        variant="outline"
        size="icon"
        loading={isLoading}
        onPress={onCancel}
        leftIcon={<Feather name="clock" size={iconSize.sm} color={colors.primary} />}
        className="h-9 w-9 rounded-full"
      />
    );
  }

  if (status === "connected") {
    return (
      <AppButton
        label="Connected"
        variant="outline"
        size="icon"
        disabled
        leftIcon={<Feather name="check" size={iconSize.sm} color={colors.primary} />}
        className="h-9 w-9 rounded-full"
      />
    );
  }

  return (
    <AppButton
      label="Connect"
      size="icon"
      loading={isLoading}
      onPress={onConnect}
      leftIcon={<Feather name="user-plus" size={iconSize.sm} color={colors.onPrimary} />}
      className="h-9 w-9 rounded-full"
    />
  );
};

export const ConnectButton = memo(({ profile, compact = false }: ConnectButtonProps) => {
  const colors = useThemeTokens();
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

  if (compact) {
    return (
      <>
        <CompactConnectButton
          status={status}
          isLoading={isStatusLoading || isMutating}
          onConnect={openConnectModal}
          onAccept={acceptIncoming}
          onDecline={declineIncoming}
          onCancel={cancelOutgoing}
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
  }

  // These render as direct children of the caller's own flex-row (see
  // UserConnectActions) so every button — including both Accept and
  // Decline when there are two — gets an equal flex-1 share of the row.
  // Nesting them in a second flex-row here instead squeezed both into the
  // single share meant for one button, clipping the labels.
  const rowClass = "flex-1 rounded-full";

  // 🟢 FIX: Matches backend value "incoming_pending" exactly
  if (status === "incoming_pending") {
    return (
      <>
        <AppButton
          label="Accept"
          size="default"
          loading={isMutating}
          onPress={() => void acceptIncoming()}
          leftIcon={<Feather name="check" size={iconSize.sm} color={colors.onPrimary} />}
          className={rowClass}
        />
        <AppButton
          label="Decline"
          variant="outline"
          size="default"
          loading={isMutating}
          onPress={() => void declineIncoming()}
          leftIcon={<Feather name="x" size={iconSize.sm} color={colors.primary} />}
          className={rowClass}
        />
      </>
    );
  }

  // 🟢 FIX: Matches backend value "outgoing_pending" exactly
  if (status === "outgoing_pending") {
    return (
      <AppButton
        label="Cancel Request" // Changed from "Pending" to visually represent the action
        variant="outline"
        size="default"
        loading={isMutating}
        onPress={() => void cancelOutgoing()}
        leftIcon={<Feather name="clock" size={iconSize.sm} color={colors.primary} />}
        className={rowClass}
      />
    );
  }

  if (status === "connected") {
    return (
      <AppButton
        label="Connected"
        variant="outline"
        size="default"
        disabled
        leftIcon={<Feather name="check" size={iconSize.sm} color={colors.primary} />}
        className={rowClass}
      />
    );
  }

  return (
    <>
      <AppButton
        label="Connect"
        variant="outline"
        size="default"
        loading={isStatusLoading || isMutating}
        onPress={openConnectModal}
        leftIcon={<Feather name="user-plus" size={iconSize.sm} color={colors.primary} />}
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
