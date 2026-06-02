import { Alert, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useProjectDetail } from "@/modules/project/hooks";
import { iconSize } from "@/theme/designTokens";

const roleOptions = ["co_founder", "software_engineer", "designer", "business_operations"];

export const ProjectDetailPanel = () => {
  const colors = useThemeTokens();
  const {
    currentUserId,
    selectedProject,
    members,
    reviews,
    applications,
    isDetailLoading,
    applyingProjectId,
    reviewingProjectId,
    detailErrorMessage,
    clearSelectedProject,
    applicationRole,
    setApplicationRole,
    applicationMessage,
    setApplicationMessage,
    submitApplication,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    submitReview
  } = useProjectDetail();

  if (isDetailLoading) {
    return (
      <Card className="mt-5 p-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-4 h-20 w-full" />
      </Card>
    );
  }

  if (detailErrorMessage) {
    return (
      <Card className="mt-5 p-5">
        <ErrorState message={detailErrorMessage} />
      </Card>
    );
  }

  if (!selectedProject) {
    return null;
  }

  const isOwner = currentUserId === selectedProject.ownerId;
  const isApplying = applyingProjectId === selectedProject.id;
  const isReviewing = reviewingProjectId === selectedProject.id;

  return (
    <Card className="mt-5 overflow-hidden">
      <View className="h-28 bg-primary/15" />
      <CardContent className="gap-4 p-4 pt-0">
        <View className="-mt-10 flex-row items-start gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
            <AppText tone="primary" weight="bold" size="xl">
              {selectedProject.name.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View className="min-w-0 flex-1 pt-6">
            <AppText family="display" weight="semibold" size="lg" numberOfLines={1}>
              {selectedProject.name}
            </AppText>
            <AppText tone="muted" size="sm" className="mt-1" numberOfLines={2}>
              {selectedProject.tagline || selectedProject.stage}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close project details"
            onPress={clearSelectedProject}
            className="mt-5 h-9 w-9 items-center justify-center rounded-md"
          >
            <Feather name="x" size={iconSize.md} color={colors.text} />
          </Pressable>
        </View>

        <AppText className="leading-6">{selectedProject.description || "No description yet."}</AppText>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-md bg-background p-3">
          <AppText tone="muted" size="sm">
            Applications
          </AppText>
          <AppText weight="bold" size="xl" className="mt-1">
            {applications.length}
          </AppText>
        </View>
        <View className="flex-1 rounded-md bg-background p-3">
          <AppText tone="muted" size="sm">
            Members
          </AppText>
          <AppText weight="bold" size="xl" className="mt-1">
            {members.length}
          </AppText>
        </View>
        <View className="flex-1 rounded-md bg-background p-3">
          <AppText tone="muted" size="sm">
            Reviews
          </AppText>
          <AppText weight="bold" size="xl" className="mt-1">
            {reviews.length}
          </AppText>
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-2">
        {[selectedProject.projectType, selectedProject.stage, selectedProject.fundingStage, selectedProject.location]
          .filter(Boolean)
          .map((item) => (
            <View key={item} className="rounded-md bg-background px-3 py-2">
              <AppText tone="muted" size="sm">
                {item}
              </AppText>
            </View>
          ))}
      </View>

      <AppText weight="bold" className="mt-5">
        Owner
      </AppText>
      <AppText tone="muted" size="sm" className="mt-2">
        {selectedProject.owner.fullName || "Startuphouze member"} {selectedProject.owner.headline ? `| ${selectedProject.owner.headline}` : ""}
      </AppText>

      <AppText weight="bold" className="mt-5">
        Members ({members.length})
      </AppText>
      <View className="mt-2 gap-2">
        {members.length > 0 ? (
          members.map((member) => (
            <AppText key={member.id} tone="muted" size="sm">
              {member.role.replace(/_/g, " ")} | {"user" in member && member.user?.fullName ? member.user.fullName : member.userId.slice(0, 8)}
            </AppText>
          ))
        ) : (
          <AppText tone="muted" size="sm">
            No members listed yet.
          </AppText>
        )}
      </View>

      <View className="mt-5 border-t border-border pt-5">
        <AppText weight="bold">Reviews ({reviews.length})</AppText>
        <View className="mt-3 gap-3">
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} className="rounded-md bg-background p-3">
                <AppText weight="semibold">
                  {"★".repeat(Math.max(1, Math.min(5, review.rating)))}
                </AppText>
                <AppText className="mt-2 leading-5">{review.comment}</AppText>
              </View>
            ))
          ) : (
            <AppText tone="muted" size="sm">
              No reviews yet.
            </AppText>
          )}
        </View>

        <AppText weight="bold" className="mt-5">
          Add review
        </AppText>
        <View className="mt-3 flex-row gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <FilterChip
              key={rating}
              label={String(rating)}
              isActive={reviewRating === rating}
              onPress={() => setReviewRating(rating)}
            />
          ))}
        </View>
        <TextInput
          value={reviewComment}
          onChangeText={setReviewComment}
          placeholder="Share your review..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          className="mt-3 min-h-20 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
        />
        <AppButton
          label="Post review"
          loading={isReviewing}
          disabled={!reviewComment.trim()}
          onPress={() => void submitReview()}
          className="mt-3"
        />
      </View>

      {!isOwner ? (
        <View className="mt-5 border-t border-border pt-5">
          <AppText weight="bold">Apply to join</AppText>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {roleOptions.map((role) => (
              <FilterChip
                key={role}
                label={role.replace(/_/g, " ")}
                isActive={applicationRole === role}
                onPress={() => setApplicationRole(role)}
              />
            ))}
          </View>
          <TextInput
            value={applicationMessage}
            onChangeText={setApplicationMessage}
            placeholder="Why do you want to join?"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="mt-3 min-h-20 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
          <AppButton
            label="Send application"
            loading={isApplying}
            disabled={!applicationMessage.trim()}
            onPress={() => void submitApplication()}
            className="mt-3"
          />
        </View>
      ) : null}
      </CardContent>
    </Card>
  );
};
