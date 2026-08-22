import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";
import { useCommunityDetail } from "@/modules/community/hooks";
import { PeoplePickerModal } from "@/modules/meeting/components/PeoplePickerModal";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";

type CommunityDetailRoute = RouteProp<MainStackParamList, "CommunityDetail">;

export const CommunityDetailScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const route = useRoute<CommunityDetailRoute>();
  const { community, mutatingId, addMembers } = useCommunityDetail(route.params.id);
  const openUserProfile = useOpenUserProfile();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

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
        <AppText weight="bold" size="lg" numberOfLines={1}>
          {community?.name ?? "Community"}
        </AppText>
      </View>

      {community?.description ? (
        <AppText tone="muted" size="sm" className="mt-1">
          {community.description}
        </AppText>
      ) : null}

      <View className="mt-4 flex-row items-center justify-between">
        <AppText weight="semibold">
          {community?.memberCount ?? 0} {community?.memberCount === 1 ? "member" : "members"}
        </AppText>
        <AppButton
          label="Invite people"
          variant="outline"
          className="h-9 px-3"
          onPress={() => setIsPickerVisible(true)}
        />
      </View>

      <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
        {(community?.members ?? []).map((member) => (
          <Pressable
            key={member.id}
            accessibilityRole="button"
            onPress={() => openUserProfile(member.user.id)}
            className="flex-row items-center gap-3 border-b border-border py-3"
          >
            <Avatar name={member.user.fullName} imageUrl={member.user.avatarUrl} size="sm" fallback="mesh" />
            <View className="min-w-0 flex-1">
              <AppText weight="medium" numberOfLines={1}>
                {member.user.fullName}
              </AppText>
              {member.user.headline ? (
                <AppText tone="muted" size="xs" numberOfLines={1} className="mt-0.5">
                  {member.user.headline}
                </AppText>
              ) : null}
            </View>
            {member.role === "owner" ? (
              <AppText tone="muted" size="xs">
                Owner
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>

      <PeoplePickerModal
        visible={isPickerVisible}
        selectedIds={(community?.members ?? []).map((member) => member.user.id)}
        onClose={() => setIsPickerVisible(false)}
        onDone={async (ids) => {
          if (community) {
            const existingIds = new Set(community.members.map((member) => member.user.id));
            const newIds = ids.filter((id) => !existingIds.has(id));
            if (newIds.length) {
              await addMembers(community.id, newIds);
            }
          }
          setIsPickerVisible(false);
        }}
      />

      {mutatingId === community?.id && !community ? (
        <AppText tone="muted" size="sm" className="mt-3">
          Loading...
        </AppText>
      ) : null}
    </AppScreen>
  );
};
