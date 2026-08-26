import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { MainStackParamList } from "@/app/navigation/types";
import { iconSize } from "@/theme/designTokens";

export const JobComposer = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <Card>
      <CardContent className="flex-row items-center gap-3 p-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Feather name="briefcase" size={iconSize.md} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <AppText weight="semibold">Hiring for your startup?</AppText>
        </View>
        <AppButton label="Post job" size="sm" onPress={() => navigation.navigate("PostJob")} />
      </CardContent>
    </Card>
  );
};
