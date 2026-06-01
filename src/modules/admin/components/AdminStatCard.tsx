import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AdminStatCardProps = {
  label: string;
  value: string | number;
};

export const AdminStatCard = ({ label, value }: AdminStatCardProps) => (
  <View className="flex-1 rounded-md border border-border bg-surface p-4 shadow-sm">
    <AppText tone="muted" size="sm">
      {label}
    </AppText>
    <AppText size="2xl" weight="bold" className="mt-2">
      {value}
    </AppText>
  </View>
);
