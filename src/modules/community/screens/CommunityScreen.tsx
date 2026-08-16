import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type CommunityAction = {
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
};

export const CommunityScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();

  const actions: CommunityAction[] = [
    {
      label: "Invite people",
      description: "Discover founders, investors and talent to connect with.",
      icon: "user-plus",
      onPress: () => navigation.navigate("Discover")
    },
    {
      label: "Community events",
      description: "Host or join meetups, demo days and pitch events.",
      icon: "calendar",
      onPress: () => navigation.navigate("Tabs", { screen: "Events" })
    },
    {
      label: "My network",
      description: "See who you're connected with and manage requests.",
      icon: "users",
      onPress: () => navigation.navigate("Network")
    }
  ];

  return (
    <AppScreen>
      <View className="flex-row items-center gap-2 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          Community
        </AppText>
      </View>

      <AppText tone="muted" size="sm" className="mt-1">
        Grow your network and bring people together.
      </AppText>

      <View className="mt-6 gap-3">
        {actions.map((action) => (
          <Pressable key={action.label} accessibilityRole="button" onPress={action.onPress}>
            <Card>
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Feather name={action.icon} size={20} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <AppText weight="semibold">{action.label}</AppText>
                  <AppText tone="muted" size="sm" className="mt-1">
                    {action.description}
                  </AppText>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
};
