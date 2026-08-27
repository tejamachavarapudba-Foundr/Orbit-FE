import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { MainStackParamList } from "@/app/navigation/types";

export const EventComposer = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <View className="rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <AppText weight="bold">Host an event</AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            A space where anyone can host.
          </AppText>
        </View>
        <AppButton
          label="New event"
          size="default"
          onPress={() => navigation.navigate("CreateEvent")}
          className="rounded-full px-5"
        />
      </View>
    </View>
  );
};
