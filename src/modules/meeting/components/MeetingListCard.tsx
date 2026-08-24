import { Alert, Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { Meeting, MeetingProposal, ProfileSummary } from "@/modules/meeting/types";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));

const otherPeople = (proposal: MeetingProposal, currentUserId: string): ProfileSummary[] => {
  const people: ProfileSummary[] = [];
  if (proposal.organizer && proposal.organizerId !== currentUserId) people.push(proposal.organizer);
  for (const invitee of proposal.invitees) {
    if (invitee.userId !== currentUserId && invitee.user) people.push(invitee.user);
  }
  return people;
};

const namesLabel = (people: ProfileSummary[]) => (people.length ? people.map((p) => p.fullName).join(", ") : "Meeting");

const joinStatusText = (meeting: Meeting, currentUserId: string, personName: string) => {
  const iJoined = meeting.joins.some((j) => j.userId === currentUserId);
  const theyJoined = meeting.joins.some((j) => j.userId !== currentUserId);
  if (iJoined && theyJoined) return `You and ${personName} both joined`;
  if (iJoined) return "You joined";
  if (theyJoined) return `${personName} joined`;
  return null;
};

type ConfirmedCardProps = {
  meeting: Meeting;
  currentUserId: string;
  mutatingId: string | null;
  onCancel: (id: string) => void;
  onJoin: (id: string) => Promise<string | null>;
  readOnly?: boolean;
};

export const ConfirmedMeetingCard = ({ meeting, currentUserId, mutatingId, onCancel, onJoin, readOnly }: ConfirmedCardProps) => {
  const colors = useThemeTokens();
  const people = otherPeople(meeting.proposal, currentUserId);
  const joinStatus = joinStatusText(meeting, currentUserId, people[0]?.fullName ?? "the other person");
  // Matches the backend: once anyone has joined, cancelMeeting() rejects it —
  // hide the button instead of letting the tap round-trip into an error.
  const canCancel = meeting.status === "upcoming" && meeting.joins.length === 0;
  const isJoining = mutatingId === meeting.id;

  // meeting.meetLink is always null here — the list endpoint deliberately
  // strips it for everyone, organizer included, and only the join endpoint
  // ever hands back the real link. Checking the stale list value directly
  // (as this used to) meant the button could never actually work.
  const joinMeeting = async () => {
    const meetLink = await onJoin(meeting.id);
    if (!meetLink) return;
    try {
      await Linking.openURL(meetLink);
    } catch {
      useToastStore.getState().show({ type: "error", title: "Couldn't open Google Meet" });
    }
  };

  const confirmCancel = () => {
    Alert.alert("Cancel meeting", `Cancel "${meeting.proposal.purpose}"?`, [
      { text: "Keep it", style: "cancel" },
      { text: "Cancel meeting", style: "destructive", onPress: () => onCancel(meeting.id) }
    ]);
  };

  return (
    <Card className="p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <AppText weight="semibold" numberOfLines={1}>
            {namesLabel(people)}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            {meeting.proposal.purpose}
          </AppText>
          <AppText tone="muted" size="xs" className="mt-1">
            {formatWhen(meeting.confirmedAt)}
          </AppText>
          {joinStatus ? (
            <AppText tone="success" size="xs" weight="semibold" className="mt-1">
              {joinStatus}
            </AppText>
          ) : null}
        </View>
        <Badge
          label={meeting.status}
          variant={meeting.status === "cancelled" ? "destructive" : meeting.status === "completed" ? "secondary" : "outline"}
        />
      </View>

      {!readOnly && meeting.status === "upcoming" ? (
        <View className="mt-3 flex-row gap-2">
          <AppButton
            label="Join on Google Meet"
            size="sm"
            loading={isJoining}
            onPress={() => void joinMeeting()}
            className="flex-1"
          />
          {canCancel ? (
            <Pressable
              accessibilityRole="button"
              onPress={confirmCancel}
              disabled={isJoining}
              className="h-10 w-10 items-center justify-center rounded-md border border-border"
            >
              <Feather name="x" size={iconSize.md} color={colors.danger} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {meeting.status === "cancelled" && meeting.cancelReason ? (
        <AppText tone="muted" size="xs" className="mt-2">
          Reason: {meeting.cancelReason}
        </AppText>
      ) : null}
    </Card>
  );
};

type PendingCardProps = {
  proposal: MeetingProposal;
  currentUserId: string;
  mutatingId: string | null;
  onWithdraw: (id: string) => void;
  onRespond: (proposal: MeetingProposal) => void;
};

export const PendingProposalCard = ({ proposal, currentUserId, mutatingId, onWithdraw, onRespond }: PendingCardProps) => {
  const isOrganizer = proposal.organizerId === currentUserId;
  const people = otherPeople(proposal, currentUserId);
  const myInvite = proposal.invitees.find((item) => item.userId === currentUserId);
  const waitingLabel = isOrganizer
    ? `Waiting on ${namesLabel(people)}`
    : `${proposal.organizer?.fullName ?? "Someone"} invited you`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => !isOrganizer && onRespond(proposal)}
      disabled={isOrganizer}
    >
      <Card className="p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <AppText weight="semibold" numberOfLines={1}>
              {namesLabel(people)}
            </AppText>
            <AppText tone="muted" size="sm" className="mt-1">
              {proposal.purpose}
            </AppText>
          </View>
          <Badge label={isOrganizer ? "pending" : myInvite?.response === "rejected" ? "declined" : "respond"} variant="outline" />
        </View>
        <AppText tone="muted" size="xs" className="mt-2">
          {waitingLabel}
        </AppText>

        {isOrganizer ? (
          <AppButton
            label="Withdraw request"
            variant="outline"
            size="sm"
            loading={mutatingId === proposal.id}
            onPress={() => onWithdraw(proposal.id)}
            className="mt-3"
          />
        ) : myInvite?.response === "pending" ? (
          <AppButton label="Respond" size="sm" onPress={() => onRespond(proposal)} className="mt-3" />
        ) : null}
      </Card>
    </Pressable>
  );
};

type DeclinedCardProps = {
  proposal: MeetingProposal;
  currentUserId: string;
};

export const DeclinedProposalCard = ({ proposal, currentUserId }: DeclinedCardProps) => {
  const people = otherPeople(proposal, currentUserId);
  return (
    <Card className="p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <AppText weight="semibold" numberOfLines={1}>
            {namesLabel(people)}
          </AppText>
          <AppText tone="muted" size="sm" className="mt-1">
            {proposal.purpose}
          </AppText>
        </View>
        <Badge label={proposal.status} variant="destructive" />
      </View>
    </Card>
  );
};
