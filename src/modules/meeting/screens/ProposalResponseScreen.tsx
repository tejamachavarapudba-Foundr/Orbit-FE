import { useEffect, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { meetingApi } from "@/modules/meeting/api";
import { useMeetingsStore } from "@/modules/meeting/store";
import { MeetingProposal, ProposedSlot } from "@/modules/meeting/types";

export const ProposalResponseScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const proposalId = route.params?.proposalId as string;
  const currentUserId = useAuthStore((state) => state.user?.profile?.id) ?? "";
  const respondToProposal = useMeetingsStore((state) => state.respondToProposal);
  const mutatingId = useMeetingsStore((state) => state.mutatingId);

  const [proposal, setProposal] = useState<MeetingProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDecline, setShowDecline] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    meetingApi
      .getProposal(proposalId)
      .then(setProposal)
      .finally(() => setIsLoading(false));
  }, [proposalId]);

  const accept = async (slot: ProposedSlot) => {
    const success = await respondToProposal(proposalId, { action: "accept", selectedSlot: slot });
    if (success) navigation.goBack();
  };

  const decline = async () => {
    const success = await respondToProposal(proposalId, { action: "reject", replyMessage: replyMessage.trim() || undefined });
    if (success) navigation.goBack();
  };

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="w-full max-w-2xl self-center px-4 pt-4">
        {isLoading || !proposal ? (
          <View className="gap-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </View>
        ) : (
          <Card>
            <CardContent className="gap-4 p-4">
              <View>
                <AppText weight="semibold" size="lg">
                  {proposal.purpose}
                </AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  Meeting request from {proposal.organizer?.fullName ?? "a member of your network"}
                </AppText>
                {proposal.message ? (
                  <AppText size="sm" className="mt-2 leading-6">
                    {proposal.message}
                  </AppText>
                ) : null}
              </View>

              <View className="gap-2">
                {(proposal.proposedSlots ?? []).map((slot) => (
                  <View
                    key={`${slot.date}-${slot.time}`}
                    className="flex-row items-center justify-between rounded-md border border-border bg-muted-bg p-3"
                  >
                    <AppText weight="medium" size="sm">
                      {slot.date} &middot; {slot.time}
                    </AppText>
                    <AppButton
                      label="Accept"
                      size="sm"
                      loading={mutatingId === proposalId}
                      onPress={() => void accept(slot)}
                    />
                  </View>
                ))}
              </View>

              {!showDecline ? (
                <AppButton
                  label="None of these work for me"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowDecline(true)}
                />
              ) : (
                <View className="gap-2 rounded-md border border-border bg-muted-bg p-3">
                  <AppText weight="semibold" size="sm">
                    Suggest a different time (optional)
                  </AppText>
                  <TextInput
                    value={replyMessage}
                    onChangeText={setReplyMessage}
                    placeholder="I'm available on 28/08 at 4pm instead..."
                    placeholderTextColor={colors.muted}
                    multiline
                    className="min-h-[70px] rounded-md border border-input bg-background p-3 text-sm text-text"
                    textAlignVertical="top"
                  />
                  <AppButton
                    label="Decline this request"
                    variant="outline"
                    size="sm"
                    loading={mutatingId === proposalId}
                    onPress={() => void decline()}
                  />
                </View>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </AppScreen>
  );
};
