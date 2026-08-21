import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation/types";
import { ForgotPasswordScreen } from "@/modules/auth/screens/ForgotPasswordScreen";
import { LoginScreen } from "@/modules/auth/screens/LoginScreen";
import { RegisterScreen } from "@/modules/auth/screens/RegisterScreen";
import { ResetPasswordScreen } from "@/modules/auth/screens/ResetPasswordScreen";
import { WelcomeScreen } from "@/modules/auth/screens/WelcomeScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);
