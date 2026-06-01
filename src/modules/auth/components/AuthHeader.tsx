import { View } from "react-native";

import { AppLogo } from "@/components/brand/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const AuthHeader = () => (
  <View className="flex-row items-center justify-between pt-4">
    <AppLogo />
    <ThemeToggle />
  </View>
);
