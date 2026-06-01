import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppScreenProps = PropsWithChildren<{
  withHorizontalPadding?: boolean;
}>;

export const AppScreen = ({ children, withHorizontalPadding = true }: AppScreenProps) => (
  <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
    <View className={withHorizontalPadding ? "flex-1 px-5" : "flex-1"}>{children}</View>
  </SafeAreaView>
);
