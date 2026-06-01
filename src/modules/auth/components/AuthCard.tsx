import { PropsWithChildren } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <View className="mt-8 rounded-md border border-border bg-surface p-5 shadow-sm">
    <AppText size="2xl" weight="bold">
      {title}
    </AppText>
    <AppText tone="muted" className="mt-2">
      {subtitle}
    </AppText>
    <View className="mt-6 gap-4">{children}</View>
  </View>
);
