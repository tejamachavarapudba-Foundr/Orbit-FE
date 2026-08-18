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
import { Feather, Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts as useExpoFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { vars } from "nativewind";
import { RootNavigator } from "@/app/navigation/RootNavigator";
import { queryClient } from "@/services/api/queryClient";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";
import { darkThemeVars, lightThemeVars } from "@/theme/nativeThemeVars";

export default function App() {
  const bootstrapTheme = useThemeStore((state) => state.bootstrap);
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const colorScheme = useThemeStore((state) => state.resolvedScheme);
  const themeVarsStyle = vars(colorScheme === "dark" ? darkThemeVars : lightThemeVars);

  const [manropeLoaded, manropeError] = useManropeFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold
  });

  const [soraLoaded, soraError] = useSoraFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold
  });

  const [iconFontsLoaded, iconFontsError] = useExpoFonts({
    ...Feather.font,
    ...Ionicons.font
  });

  const fontLoadError = manropeError ?? soraError ?? iconFontsError;
  const fontsLoaded = manropeLoaded && soraLoaded && iconFontsLoaded;

  useEffect(() => {
    if (__DEV__ && fontLoadError) {
      console.warn("Failed to load app fonts", fontLoadError);
    }
  }, [fontLoadError]);

  useEffect(() => {
    void bootstrapTheme();
    void bootstrapAuth();
  }, [bootstrapAuth, bootstrapTheme]);

  if (!fontsLoaded && !fontLoadError) {
    return (
      <GestureHandlerRootView className={colorScheme === "dark" ? "dark" : ""} style={[{ flex: 1 }, themeVarsStyle]}>
        <SafeAreaProvider>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#0A66C2" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView className={colorScheme === "dark" ? "dark" : ""} style={[{ flex: 1 }, themeVarsStyle]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
