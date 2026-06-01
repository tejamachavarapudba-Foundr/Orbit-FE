import { PropsWithChildren } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <Card elevated className="mt-6 w-full max-w-md self-center rounded-2xl p-8">
    <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
      {title}
    </AppText>
    <AppText tone="muted" size="sm" className="mt-1">
      {subtitle}
    </AppText>
    <View className="mt-6 gap-4">{children}</View>
  </Card>
);
