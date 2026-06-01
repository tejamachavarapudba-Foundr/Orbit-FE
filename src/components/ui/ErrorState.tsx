import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <View className="flex-1 items-center justify-center gap-3 px-6">
    <AppText size="xl" weight="semibold" tone="danger" className="text-center">
      We hit a snag
    </AppText>
    <AppText tone="muted" className="text-center">
      {message}
    </AppText>
    {onRetry ? <AppButton label="Retry" onPress={onRetry} className="mt-3 w-full" /> : null}
  </View>
);
