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
import { Orbitron_500Medium, useFonts as useOrbitronFonts } from "@expo-google-fonts/orbitron";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getCrashlytics, recordError, setCrashlyticsCollectionEnabled } from "@react-native-firebase/crashlytics";
import * as Sentry from "@sentry/react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts as useExpoFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { vars } from "nativewind";
import { RootNavigator } from "@/app/navigation/RootNavigator";
import { appConfig } from "@/constants/config";
import { queryClient } from "@/services/api/queryClient";
import { asyncStoragePersister, QUERY_CACHE_MAX_AGE_MS } from "@/services/api/queryPersister";
import { useAuthStore } from "@/modules/auth/store";
import { startPushNotifications } from "@/modules/notifications/pushNotifications";
import { useThemeStore } from "@/store/themeStore";
import { darkThemeVars, lightThemeVars } from "@/theme/nativeThemeVars";

// No DSN yet — appConfig.sentryDsn is empty until one's added, and the SDK
// would otherwise install its own (no-op) global handler ahead of the
// Crashlytics one being chained in below.
if (appConfig.sentryDsn) {
  Sentry.init({
    dsn: appConfig.sentryDsn,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: 0.2,
  });
}

const crashlyticsInstance = getCrashlytics();
void setCrashlyticsCollectionEnabled(crashlyticsInstance, !__DEV__);

// Sentry.init() above already installed its own ErrorUtils handler when a
// DSN is configured — chaining this one after it means both Crashlytics
// and Sentry see every fatal error, not just whichever set its handler last.
const previousHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  recordError(crashlyticsInstance, error);
  previousHandler(error, isFatal);
});

export default function App() {
  const bootstrapTheme = useThemeStore((state) => state.bootstrap);
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const userId = useAuthStore((state) => state.user?.id);
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

  // Used only for the "ORBIT" wordmark in AppLogo (screen headers) — not
  // part of the body/display type scale, so it isn't in fontFamilyClass.
  const [orbitronLoaded, orbitronError] = useOrbitronFonts({ Orbitron_500Medium });

  const fontLoadError = manropeError ?? soraError ?? iconFontsError ?? orbitronError;
  const fontsLoaded = manropeLoaded && soraLoaded && iconFontsLoaded && orbitronLoaded;

  useEffect(() => {
    if (__DEV__ && fontLoadError) {
      console.warn("Failed to load app fonts", fontLoadError);
    }
  }, [fontLoadError]);

  useEffect(() => {
    void bootstrapTheme();
    void bootstrapAuth();
  }, [bootstrapAuth, bootstrapTheme]);

  useEffect(() => {
    if (userId) {
      void startPushNotifications();
    }
  }, [userId]);

  if (!fontsLoaded && !fontLoadError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* NativeWind only propagates CSS variables (vars()/dark:) to
            descendants through components it instruments (plain View,
            Text, ...) — third-party wrappers like GestureHandlerRootView
            aren't auto-instrumented, so the theme has to be applied here
            on a plain View, not on the root above. */}
        <View className={colorScheme === "dark" ? "dark" : ""} style={[{ flex: 1 }, themeVarsStyle]}>
          <SafeAreaProvider>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#0A66C2" />
            </View>
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={colorScheme === "dark" ? "dark" : ""} style={[{ flex: 1 }, themeVarsStyle]}>
        <SafeAreaProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: asyncStoragePersister,
              maxAge: QUERY_CACHE_MAX_AGE_MS,
              buster: userId ?? "anon",
              dehydrateOptions: {
                shouldDehydrateQuery: (query) => query.state.status === "success"
              }
            }}
          >
            <RootNavigator />
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </PersistQueryClientProvider>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
  );
}
