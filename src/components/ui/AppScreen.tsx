import { PropsWithChildren } from "react";
import { View } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

type AppScreenProps = PropsWithChildren<{
  withHorizontalPadding?: boolean;
  contentContainerClassName?: string;
  edges?: Edge[];
}>;

export const AppScreen = ({
  children,
  withHorizontalPadding = true,
  contentContainerClassName,
  edges = ["top", "left", "right"]
}: AppScreenProps) => (
  <SafeAreaView className="flex-1 bg-background" edges={edges}>
    <View className={contentContainerClassName ?? (withHorizontalPadding ? "flex-1 px-5" : "flex-1")}>{children}</View>
  </SafeAreaView>
);
