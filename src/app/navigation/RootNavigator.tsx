import { NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { RootStackParamList } from "@/app/navigation/types";
import { AuthNavigator } from "@/app/navigation/AuthNavigator";
import { MainStackNavigator } from "@/app/navigation/MainStackNavigator";
import { OnboardingNavigator } from "@/app/navigation/OnboardingNavigator";
import { needsOnboarding } from "@/modules/profile/needsOnboarding";
import { VerifyEmailOtpScreen } from "@/modules/auth/screens/VerifyEmailOtpScreen";
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
  const emailVerified = useAuthStore((state) => state.user?.emailVerified);
  // Hard gate — any authenticated account without a verified email is sent
  // here, every session, until they verify. There is no skip.
  const needsEmailOtp = isAuthenticated && !emailVerified;
  const showOnboarding = isAuthenticated && !needsEmailOtp && needsOnboarding(profile);

  const resolvedScheme = useThemeStore(
    (state) => state.resolvedScheme,
  );
  
  const navigationTheme = useMemo<Theme>(
    () => ({
      dark: resolvedScheme === "dark",
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
      fonts: {
        regular: { fontFamily: "System", fontWeight: "400" },
        medium: { fontFamily: "System", fontWeight: "500" },
        bold: { fontFamily: "System", fontWeight: "700" },
        heavy: { fontFamily: "System", fontWeight: "800" },
      },
    }),
    [resolvedScheme, colors],
  );

  if (!isAuthHydrated || !isThemeHydrated) {
    return (
      <AppScreen>
        <Skeleton className="mt-24 h-10 w-2/3 self-center" />
      </AppScreen>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsEmailOtp ? (
          <Stack.Screen name="VerifyEmailOtp" component={VerifyEmailOtpScreen} />
        ) : showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};
