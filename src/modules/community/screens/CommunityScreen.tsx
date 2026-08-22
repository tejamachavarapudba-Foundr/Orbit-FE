import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { CreateCommunityModal } from "@/modules/community/components/CreateCommunityModal";
import { useCommunities } from "@/modules/community/hooks";

type CommunityAction = {
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
};

export const CommunityScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { communities, isLoading, isCreating, createCommunity } = useCommunities();
  const [isCreateVisible, setIsCreateVisible] = useState(false);

  const actions: CommunityAction[] = [
    {
      label: "Create a community",
      description: "Start a group like Founders Community or Professionals Community.",
      icon: "user-plus",
      onPress: () => setIsCreateVisible(true)
    },
    {
      label: "Community events",
      description: communities.length
        ? "Host a private meetup for one of your communities, or join public events."
        : "Create a community group first, then host private events for its members.",
      icon: "calendar",
      onPress: () => {
        if (!communities.length) {
          Alert.alert(
            "No community groups yet",
            "Create a community group first — then you can host private events just for its members.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Create community", onPress: () => setIsCreateVisible(true) }
            ]
          );
          return;
        }
        navigation.navigate("Tabs", { screen: "Events" });
      }
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

      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View className="mt-8">
          <AppText weight="bold">My communities</AppText>

          {isLoading && !communities.length ? (
            <AppText tone="muted" size="sm" className="mt-3">
              Loading your communities...
            </AppText>
          ) : null}

          {!isLoading && !communities.length ? (
            <AppText tone="muted" size="sm" className="mt-3">
              You haven't joined or created any communities yet.
            </AppText>
          ) : null}

          <View className="mt-3 gap-3">
            {communities.map((community) => (
              <Pressable
                key={community.id}
                accessibilityRole="button"
                onPress={() => navigation.navigate("CommunityDetail", { id: community.id })}
              >
                <Card>
                  <CardContent className="flex-row items-center gap-4 p-4">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                      <Feather name="users" size={20} color={colors.primary} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <AppText weight="semibold" numberOfLines={1}>
                        {community.name}
                      </AppText>
                      <AppText tone="muted" size="sm" className="mt-1">
                        {community.memberCount} {community.memberCount === 1 ? "member" : "members"}
                      </AppText>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.muted} />
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <CreateCommunityModal
        visible={isCreateVisible}
        isCreating={isCreating}
        onClose={() => setIsCreateVisible(false)}
        onCreate={async (name, description, memberIds) => {
          const community = await createCommunity({ name, description, memberIds });
          if (community) {
            setIsCreateVisible(false);
          }
        }}
      />
    </AppScreen>
  );
};
