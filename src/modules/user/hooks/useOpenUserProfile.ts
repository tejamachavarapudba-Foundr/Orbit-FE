import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { MainStackParamList } from "@/app/navigation/types";

export const useOpenUserProfile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return useCallback(
    (userId: string) => {
      const stackNavigation = navigation.getParent<NativeStackNavigationProp<MainStackParamList>>() ?? navigation;
      stackNavigation.navigate("UserProfile", { userId });
    },
    [navigation]
  );
};
