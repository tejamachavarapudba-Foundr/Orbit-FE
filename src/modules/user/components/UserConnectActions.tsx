import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { MainStackParamList } from "@/app/navigation/types";
import { ConnectButton } from "@/modules/connections/components/ConnectButton";
import { useCanMessageUser, useConnectionAction } from "@/modules/connections/hooks";
import { useAuthStore } from "@/modules/auth/store";
import { useChatStore } from "@/modules/chat/store";
import { FollowProfile } from "@/modules/follows/types";
import { useToastStore } from "@/store/toastStore";

type UserConnectActionsProps = {
  profile: FollowProfile;
};

export const UserConnectActions = ({ profile }: UserConnectActionsProps) => {
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
      {status === "pending_incoming" && incomingNote ? (
        <View className="mb-4 rounded-md border border-border bg-background p-3">
          <AppText tone="muted" size="sm" weight="medium">
            Connection note
          </AppText>
          <AppText className="mt-2 leading-5">"{incomingNote}"</AppText>
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ConnectButton profile={profile} />
        </View>
        <AppButton
          label="Message"
          variant="outline"
          loading={isCreating}
          disabled={!canMessage}
          onPress={() => void handleMessage()}
          className="h-11 flex-1"
        />
      </View>
    </View>
  );
};
