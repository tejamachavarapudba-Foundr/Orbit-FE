import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppScreenProps = PropsWithChildren<{
  withHorizontalPadding?: boolean;
  contentContainerClassName?: string;
}>;

export const AppScreen = ({ children, withHorizontalPadding = true, contentContainerClassName }: AppScreenProps) => (
  <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
    <View className={contentContainerClassName ?? (withHorizontalPadding ? "flex-1 px-5" : "flex-1")}>{children}</View>
  </SafeAreaView>
);
