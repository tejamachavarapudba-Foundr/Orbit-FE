import "react-native-gesture-handler";
import "./global.css";

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts as useManropeFonts
} from "@expo-google-fonts/manrope";
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts as useSoraFonts
} from "@expo-google-fonts/sora";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Font from "expo-font";
import { RootNavigator } from "@/app/navigation/RootNavigator";
import { queryClient } from "@/services/api/queryClient";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";

export default function App() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const bootstrapTheme = useThemeStore((state) => state.bootstrap);
  const colorScheme = useThemeStore((state) => state.resolvedScheme);
  

  const [manropeLoaded] = useManropeFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold
  });

  const [soraLoaded] = useSoraFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold
  });

  const fontsLoaded = true;
  
  useEffect(() => {
    console.log("Loaded fonts:", Font.getLoadedFonts());
  }, []);
  
  useEffect(() => {
    void bootstrapTheme();
  
    // TEMPORARILY DISABLE
    // void bootstrapAuth();
  }, []);

  
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
