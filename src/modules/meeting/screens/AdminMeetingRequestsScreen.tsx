import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

import { useAdminMeetings } from "@/modules/meeting/hooks";
import { MeetingCard } from "@/modules/meeting/components/MeetingCard";

export const AdminMeetingRequestsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const {
    meetings,
    isLoading,
    refresh,
    updateStatus,
  } = useAdminMeetings();

  const handleStatus = async (
    id: string,
    status:
      | "approved"
      | "rejected"
      | "founder_contacted",
  ) => {
    await updateStatus(id, status);

    await refresh();
  };

  return (
    <AppScreen
      contentContainerClassName="flex-1 p-4"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => navigation.goBack()}
        className="mb-2 h-9 w-9 items-center justify-center rounded-md"
      >
        <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
      </Pressable>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void refresh()}
          />
        }
      >
        {/* Header */}

        <View className="mb-6">

          <AppText
            size="2xl"
            weight="bold"
          >
            Meeting Requests
          </AppText>

          <AppText
            tone="muted"
            className="mt-1"
          >
            Review investor meeting requests.
          </AppText>

        </View>

        {/* Empty */}

        {!isLoading &&
          meetings.length === 0 && (
            <View className="mt-24 items-center">

              <AppText
                size="lg"
                weight="bold"
              >
                No Requests
              </AppText>

              <AppText
                tone="muted"
                className="mt-2"
              >
                Everything is up to date.
              </AppText>

            </View>
          )}

        {/* Cards */}

        {meetings.map(
          (meeting) => (
            <View
              key={meeting.id}
              className="mb-5"
            >
              <MeetingCard
                meeting={meeting}
                role="admin"
              />

              {/* Admin Actions */}

              <View className="mt-3 flex-row flex-wrap gap-2">

                <AppButton
                  label="Approve"
                  size="sm"
                  className="flex-1"
                  onPress={() =>
                    void handleStatus(
                      meeting.id,
                      "approved",
                    )
                  }
                />

                <AppButton
                  label="Founder Contacted"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onPress={() =>
                    void handleStatus(
                      meeting.id,
                      "founder_contacted",
                    )
                  }
                />

                <AppButton
                  label="Reject"
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onPress={() =>
                    void handleStatus(
                      meeting.id,
                      "rejected",
                    )
                  }
                />

              </View>

            </View>
          ),
        )}

      </ScrollView>
    </AppScreen>
  );
};