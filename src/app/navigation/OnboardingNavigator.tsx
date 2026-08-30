import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { OnboardingGoalsScreen } from "@/modules/onboarding/screens/OnboardingGoalsScreen";
import { OnboardingQuickProfileScreen } from "@/modules/onboarding/screens/OnboardingQuickProfileScreen";
import { OnboardingWelcomeScreen } from "@/modules/onboarding/screens/OnboardingWelcomeScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
    <Stack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
    <Stack.Screen name="OnboardingQuickProfile" component={OnboardingQuickProfileScreen} />
  </Stack.Navigator>
);
