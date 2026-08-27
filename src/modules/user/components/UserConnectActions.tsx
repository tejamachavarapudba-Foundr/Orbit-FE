import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { MainStackParamList } from "@/app/navigation/types";
import { ConnectButton } from "@/modules/connections/components/ConnectButton";
import { useCanMessageUser, useConnectionAction } from "@/modules/connections/hooks";
import { useAuthStore } from "@/modules/auth/store";
import { useChatStore } from "@/modules/chat/store";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { FollowProfile } from "@/modules/follows/types";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

type UserConnectActionsProps = {
  profile: FollowProfile;
};

export const UserConnectActions = ({ profile }: UserConnectActionsProps) => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const createChat = useChatStore((state) => state.createChat);
  const isCreating = useChatStore((state) => state.isCreating);
  const showToast = useToastStore((state) => state.show);
  const canMessage = useCanMessageUser(profile.id);
  const { status, incomingNote } = useConnectionAction(profile);

  if (profile.id === currentUserId) {
    return (
      <AppButton
        label="Edit profile"
        onPress={() => navigation.navigate("Tabs", { screen: "Profile" } as never)}
        className="flex-1"
      />
    );
  }

  const handleMessage = async () => {
    if (!canMessage) {
      showToast({
        type: "info",
        title: "Connect first",
        message: "Send a connection request and wait for acceptance to message."
      });
      return;
    }

    const success = await createChat(profile.id);
    if (success) {
      navigation.navigate("Tabs", { screen: "Messages" } as never);
    }
  };

  return (
    <View>
      {status === "incoming_pending" && incomingNote ? (
        <View className="mb-4 rounded-md border border-border bg-background p-3">
          <AppText tone="muted" size="sm" weight="medium">
            Connection note
          </AppText>
          <AppText className="mt-2 leading-5">"{incomingNote}"</AppText>
        </View>
      ) : null}
      <View className="flex-row gap-3">
        {/* ConnectButton renders 1 or 2 AppButtons depending on connection
            status (e.g. Accept + Decline) — all as direct children of this
            row, alongside Message, so every button gets an equal flex-1
            share whether there are two buttons here or three. */}
        <ConnectButton profile={profile} />
        <AppButton
          label="Message"
          size="default"
          loading={isCreating}
          disabled={!canMessage}
          onPress={() => void handleMessage()}
          leftIcon={<Feather name="send" size={iconSize.sm} color={colors.onPrimary} />}
          className="flex-1 rounded-full"
        />
      </View>
    </View>
  );
};
