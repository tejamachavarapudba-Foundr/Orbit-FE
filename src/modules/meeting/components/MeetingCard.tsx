import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Card, CardContent } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { useThemeTokens } from "@/hooks/useThemeTokens";

import {
  MeetingRequest,
  MeetingRole,
} from "@/modules/meeting/types";

import { MeetingStatusBadge } from "./MeetingStatusBadge";

type Props = {
  meeting: MeetingRequest;

  role: MeetingRole;

  onPress?: () => void;

  onApprove?: () => void;

  onReject?: () => void;

  onContact?: () => void;
};

export const MeetingCard = ({
  meeting,
  role,
  onPress,
  onApprove,
  onReject,
  onContact,
}: Props) => {
  const colors = useThemeTokens();

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4">
        <CardContent className="p-4">

          {/* Header */}

          <View className="flex-row justify-between items-start">

            <View className="flex-1">

              <AppText
                weight="bold"
                size="lg"
              >
                {meeting.startup?.name ??
                  "Startup"}
              </AppText>

              <AppText
                tone="muted"
                size="sm"
              >
                {meeting.purpose}
              </AppText>

            </View>

            <MeetingStatusBadge
              status={meeting.status}
            />

          </View>

          {/* Date */}

          <View className="mt-4 flex-row items-center">

            <Feather
              name="calendar"
              size={16}
              color={colors.muted}
            />

            <AppText
              className="ml-2"
            >
              {meeting.preferredDate1}
            </AppText>

          </View>

          {/* Time */}

          <View className="mt-2 flex-row items-center">

            <Feather
              name="clock"
              size={16}
              color={colors.muted}
            />

            <AppText
              className="ml-2"
            >
              {meeting.preferredTime1}
            </AppText>

          </View>

          {/* Investment */}

          {!!meeting.expectedInvestment && (

            <View className="mt-2 flex-row items-center">

              <Feather
                name="dollar-sign"
                size={16}
                color={colors.muted}
              />

              <AppText
                className="ml-2"
              >
                {meeting.expectedInvestment}
              </AppText>

            </View>

          )}

          {/* Message */}

          {!!meeting.message && (

            <View className="mt-4">

              <AppText
                tone="muted"
                size="sm"
              >
                Message
              </AppText>

              <AppText
                className="mt-1"
              >
                {meeting.message}
              </AppText>

            </View>

          )}

          {/* Footer */}

          
          {role === "founder" &&
            meeting.status ===
              "founder_contacted" && (
              <View className="mt-5">

                <AppButton
                  label="Contact Investor"
                  onPress={onContact}
                />

              </View>
            )}

        </CardContent>
      </Card>
    </Pressable>
  );
};