import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AuthErrorBannerProps = {
  message: string | null;
};

export const AuthErrorBanner = ({ message }: AuthErrorBannerProps) => {
  if (!message) {
    return null;
  }

  return (
    <View className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3">
      <AppText tone="danger" size="sm" weight="medium">
        {message}
      </AppText>
    </View>
  );
};
