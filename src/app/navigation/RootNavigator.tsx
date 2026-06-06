import { NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "@/app/navigation/types";
import { AuthNavigator } from "@/app/navigation/AuthNavigator";
import { MainNavigator } from "@/app/navigation/MainNavigator";
import { OnboardingNavigator } from "@/app/navigation/OnboardingNavigator";
import { needsOnboarding } from "@/modules/profile/needsOnboarding";
import { Toast } from "@/components/feedback/Toast";
import { AppScreen } from "@/components/ui/AppScreen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const colors = useThemeTokens();
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const isThemeHydrated = useThemeStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.status === "authenticated");
  const profile = useAuthStore((state) => state.user?.profile);
  const showOnboarding = isAuthenticated && needsOnboarding(profile);

  const navigationTheme: Theme = {
    dark: useThemeStore.getState().resolvedScheme === "dark",
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "400" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "700" },
      heavy: { fontFamily: "System", fontWeight: "800" }
    }
  };

  if (!isAuthHydrated || !isThemeHydrated) {
    return (
      <AppScreen>
        <Skeleton className="mt-12 h-10 w-40" />
        <Skeleton className="mt-8 h-40 w-full" />
        <Skeleton className="mt-4 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-full" />
      </AppScreen>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};
