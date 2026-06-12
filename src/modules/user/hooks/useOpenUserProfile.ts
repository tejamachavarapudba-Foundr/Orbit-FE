import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

export const useOpenUserProfile = () => {
  const navigation = useNavigation<any>();

  return useCallback(
    (userId: string) => {
      navigation.navigate("Main", {
        screen: "UserProfile",
        params: {
          userId,
        },
      });
    },
    [navigation]
  );
};