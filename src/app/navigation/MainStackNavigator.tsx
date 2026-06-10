import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "@/app/navigation/MainNavigator";
import { MainStackParamList } from "@/app/navigation/types";
import { UserPublicProfileScreen } from "@/modules/user/screens/UserPublicProfileScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainNavigator} />
    <Stack.Screen name="UserProfile" component={UserPublicProfileScreen} />
  </Stack.Navigator>
);
