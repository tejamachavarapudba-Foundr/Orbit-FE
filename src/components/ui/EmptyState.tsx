import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyStateIcon } from "@/components/ui/LoadingState";
import { Feather } from "@expo/vector-icons";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Feather.glyphMap;
};

export const EmptyState = ({ title, message, actionLabel, onAction, icon = "inbox" }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center px-4">
    <Card className="w-full max-w-md">
      <CardContent className="items-center py-10">
        <EmptyStateIcon name={icon} />
        <AppText family="display" size="lg" weight="semibold" className="mt-2 text-center">
          {title}
        </AppText>
        <AppText tone="muted" size="sm" className="mt-2 text-center">
          {message}
        </AppText>
        {actionLabel && onAction ? (
          <AppButton label={actionLabel} onPress={onAction} className="mt-5 w-full" size="default" />
        ) : null}
      </CardContent>
    </Card>
  </View>
);
