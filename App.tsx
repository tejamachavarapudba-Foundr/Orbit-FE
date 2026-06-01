import "react-native-gesture-handler";
import "./global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/app/navigation/RootNavigator";
import { queryClient } from "@/services/api/queryClient";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";

export default function App() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const bootstrapTheme = useThemeStore((state) => state.bootstrap);
  const colorScheme = useThemeStore((state) => state.resolvedScheme);

  useEffect(() => {
    void bootstrapTheme();
    void bootstrapAuth();
  }, [bootstrapAuth, bootstrapTheme]);

  return (
    <GestureHandlerRootView className={colorScheme === "dark" ? "dark" : ""} style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
