import { Pressable, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useProjectDetail } from "@/modules/project/hooks";

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
      <View className="mt-5 rounded-md border border-border bg-surface p-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-4 h-20 w-full" />
      </View>
    );
  }

  if (detailErrorMessage) {
    return (
      <View className="mt-5 rounded-md border border-border bg-surface p-5">
        <ErrorState message={detailErrorMessage} />
      </View>
    );
  }

  if (!selectedProject) {
    return null;
  }

  const isOwner = currentUserId === selectedProject.ownerId;
  const isApplying = applyingProjectId === selectedProject.id;
  const isReviewing = reviewingProjectId === selectedProject.id;

  return (
    <View className="mt-5 rounded-md border border-border bg-surface p-5 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-md bg-primary">
          <AppText tone="onPrimary" weight="bold" size="xl">
            {selectedProject.name.charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View className="flex-1">
          <AppText weight="bold" size="xl">
            {selectedProject.name}
          </AppText>
          <AppText tone="primary" weight="medium" className="mt-1">
            {selectedProject.tagline || selectedProject.stage}
          </AppText>
        </View>
        <AppButton label="Close" variant="ghost" onPress={clearSelectedProject} className="h-10 px-3" />
      </View>

      <AppText className="mt-5 leading-6">{selectedProject.description || "No description yet."}</AppText>

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
          {[1, 2, 3, 4, 5].map((rating) => {
            const isActive = reviewRating === rating;
            return (
              <Pressable
                key={rating}
                accessibilityRole="button"
                onPress={() => setReviewRating(rating)}
                className={`h-10 w-10 items-center justify-center rounded-md border ${
                  isActive ? "border-primary bg-primary" : "border-border bg-background"
                }`}
              >
                <AppText tone={isActive ? "onPrimary" : "muted"} weight="bold">
                  {rating}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={reviewComment}
          onChangeText={setReviewComment}
          placeholder="Share your review..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          className="mt-3 min-h-20 rounded-md border border-border bg-background px-4 py-3 text-base text-text"
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
            {roleOptions.map((role) => {
              const isActive = applicationRole === role;
              return (
                <Pressable
                  key={role}
                  accessibilityRole="button"
                  onPress={() => setApplicationRole(role)}
                  className={`rounded-md border px-3 py-2 ${isActive ? "border-primary bg-primary" : "border-border bg-background"}`}
                >
                  <AppText tone={isActive ? "onPrimary" : "muted"} size="sm" weight="medium">
                    {role.replace(/_/g, " ")}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={applicationMessage}
            onChangeText={setApplicationMessage}
            placeholder="Why do you want to join?"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="mt-3 min-h-20 rounded-md border border-border bg-background px-4 py-3 text-base text-text"
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
    </View>
  );
};
