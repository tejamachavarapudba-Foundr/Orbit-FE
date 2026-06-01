import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, message, actionLabel, onAction }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center gap-3 px-6">
    <AppText size="xl" weight="semibold" className="text-center">
      {title}
    </AppText>
    <AppText tone="muted" className="text-center">
      {message}
    </AppText>
    {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} className="mt-3 w-full" /> : null}
  </View>
);
