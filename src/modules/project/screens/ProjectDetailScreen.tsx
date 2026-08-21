import { useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { MainStackParamList } from "@/app/navigation/types";
import { ProjectComposer } from "@/modules/project/components/ProjectComposer";
import { useProjectDetail } from "@/modules/project/hooks";
import { useProjectStore } from "@/modules/project/store";
import { iconSize } from "@/theme/designTokens";

const roleOptions = ["co_founder", "software_engineer", "designer", "business_operations", "other"];

type Props = NativeStackScreenProps<MainStackParamList, "ProjectDetail">;

export const ProjectDetailScreen = ({ route }: Props) => {
  const { id, edit } = route.params;
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const updateLogo = useProjectStore((state) => state.updateLogo);
  const isSubmitting = useProjectStore((state) => state.isSubmitting);

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
    selectProject,
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

  const [isEditing, setIsEditing] = useState(!!edit);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [applyExpanded, setApplyExpanded] = useState(false);

  useEffect(() => {
    void selectProject(id);
    return () => {
      clearSelectedProject();
    };
  }, [id]);

  const handlePickLogo = async () => {
    if (!selectedProject) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await updateLogo(selectedProject.id, {
      uri: asset.uri,
      name: asset.fileName ?? "logo.jpg",
      type: asset.mimeType ?? "image/jpeg"
    });
  };

  if (isDetailLoading) {
    return (
      <AppScreen>
        <Card className="mt-5 p-5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-4 h-20 w-full" />
        </Card>
      </AppScreen>
    );
  }

  if (detailErrorMessage) {
    return (
      <AppScreen>
        <Card className="mt-5 p-5">
          <ErrorState message={detailErrorMessage} onRetry={() => void selectProject(id)} />
        </Card>
      </AppScreen>
    );
  }

  if (!selectedProject) {
    return null;
  }

  if (isEditing) {
    return (
      <AppScreen>
        <View className="flex-row items-center gap-2 pb-2 pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => setIsEditing(false)}
            className="h-9 w-9 items-center justify-center rounded-md"
          >
            <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
          </Pressable>
          <AppText weight="bold" size="lg">
            Edit project
          </AppText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProjectComposer project={selectedProject} autoExpanded onDone={() => setIsEditing(false)} />
        </ScrollView>
      </AppScreen>
    );
  }

  const isFounder = currentUserId === selectedProject.ownerId;
  const isInvestor = user?.profile?.role === "investor";
  const isApplying = applyingProjectId === selectedProject.id;
  const isReviewing = reviewingProjectId === selectedProject.id;
  const founder = selectedProject.founder;
  const myApplication = applications.find((application) => application.applicantId === currentUserId);

  return (
    <AppScreen withHorizontalPadding={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        {isFounder ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit project"
            onPress={() => setIsEditing(true)}
            className="h-9 w-9 items-center justify-center rounded-md"
          >
            <Feather name="edit-2" size={iconSize.md} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <View className="h-28 rounded-xl bg-primary/15" />

        <View className="-mt-10 flex-row items-start gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change project logo"
            disabled={!isFounder || isSubmitting}
            onPress={() => void handlePickLogo()}
            className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
          >
            {selectedProject.logoUrl ? (
              <Image source={{ uri: selectedProject.logoUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <AppText tone="primary" weight="bold" size="xl">
                {selectedProject.name.charAt(0).toUpperCase()}
              </AppText>
            )}
            {isFounder ? (
              <View className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Feather name="camera" size={10} color={colors.onPrimary} />
              </View>
            ) : null}
          </Pressable>
          <View className="min-w-0 flex-1 pt-7">
            <AppText family="display" weight="semibold" size="lg" numberOfLines={1}>
              {selectedProject.name}
            </AppText>
            <AppText tone="muted" size="sm" className="mt-1" numberOfLines={2}>
              {selectedProject.tagline || selectedProject.stage}
            </AppText>
          </View>
        </View>

        <AppText className="mt-4 leading-6">{selectedProject.description || "No description yet."}</AppText>

        <View className="mt-4 gap-2">
          {selectedProject.foundedYear ? (
            <AppText tone="muted" size="sm">
              Founded: {selectedProject.foundedYear}
            </AppText>
          ) : null}

          {selectedProject.websiteUrl ? (
            <AppText tone="primary" size="sm">
              🌐 {selectedProject.websiteUrl}
            </AppText>
          ) : null}

          {selectedProject.pitchVideoUrl ? (
            <AppButton
              size="sm"
              variant="outline"
              label="▶ Watch Founder Pitch"
              className="self-start"
              onPress={() => {
                Linking.openURL(selectedProject.pitchVideoUrl);
              }}
            />
          ) : null}
        </View>

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
              Team members
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
          {[selectedProject.category, selectedProject.projectType, selectedProject.stage, selectedProject.fundingStage, selectedProject.location]
            .filter(Boolean)
            .map((item) => (
              <View key={item} className="rounded-md bg-background px-3 py-2">
                <AppText tone="muted" size="sm">
                  {item.replace(/_/g, " ")}
                </AppText>
              </View>
            ))}
        </View>

        <AppText weight="bold" className="mt-5">
          Founder
        </AppText>
        <AppText tone="muted" size="sm" className="mt-2">
          {founder?.fullName || "Startuphouze member"} {founder?.headline ? `| ${founder.headline}` : ""}
        </AppText>

        {isFounder || isInvestor ? (
          <View className="mt-5">
            <Card>
              <CardContent className="p-4">
                <AppText weight="bold" size="lg">
                  📊 Investor Snapshot
                </AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  Complete your investor profile to unlock investor visibility.
                </AppText>

                <View className="mt-4">
                  <AppText weight="semibold">
                    {selectedProject.investorSnapshot?.isCompleted
                      ? "🟢 Investor Ready"
                      : `Progress: ${selectedProject.investorSnapshot?.completionPercentage ?? 0}%`}
                  </AppText>
                </View>

                <View className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <View
                    className="h-full bg-primary"
                    style={{ width: `${selectedProject.investorSnapshot?.completionPercentage ?? 0}%` }}
                  />
                </View>

                <AppButton
                  label={
                    selectedProject.investorSnapshot?.isCompleted
                      ? "View Investor Snapshot"
                      : (selectedProject.investorSnapshot?.completionPercentage ?? 0) > 0
                        ? "Continue Investor Snapshot"
                        : "Start Investor Snapshot"
                  }
                  className="mt-4"
                  onPress={() => {
                    if (isInvestor) {
                      navigation.navigate("InvestorSnapshotView", { projectId: selectedProject.id });
                      return;
                    }
                    navigation.navigate("BusinessSummary", { projectId: selectedProject.id, project: selectedProject });
                  }}
                />

                <View className="mt-5 border-t border-border pt-4">
                  <AppText weight="bold">Investor Highlights</AppText>
                  <View className="mt-3 gap-2">
                    <AppText size="sm">MRR: ${selectedProject.investorSnapshot?.mrr?.toLocaleString() ?? 0}</AppText>
                    <AppText size="sm">ARR: ${selectedProject.investorSnapshot?.arr?.toLocaleString() ?? 0}</AppText>
                    <AppText size="sm">
                      Raising: ${selectedProject.investorSnapshot?.amountRaising?.toLocaleString() ?? 0}
                    </AppText>
                    <AppText size="sm">Equity Offered: {selectedProject.investorSnapshot?.equityOffered ?? 0}%</AppText>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        ) : null}

        <AppText weight="bold" className="mt-5">
          Team members ({members.length})
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
          <Pressable
            accessibilityRole="button"
            onPress={() => setReviewsExpanded((current) => !current)}
            className="flex-row items-center justify-between"
          >
            <AppText weight="bold">Reviews ({reviews.length})</AppText>
            <Feather name={reviewsExpanded ? "chevron-up" : "chevron-down"} size={iconSize.md} color={colors.text} />
          </Pressable>

          {reviewsExpanded ? (
            <>
              <View className="mt-3 gap-3">
                {reviews.length > 0 ? (
                  reviews.slice(0, 3).map((review) => (
                    <View key={review.id} className="rounded-md bg-background p-3">
                      <AppText weight="semibold">{"★".repeat(Math.max(1, Math.min(5, review.rating)))}</AppText>
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
            </>
          ) : null}
        </View>

        {!isFounder ? (
          <View className="mt-5 border-t border-border pt-5">
            {myApplication ? (
              <View className="flex-row items-center justify-between">
                <AppText weight="bold">Apply to join</AppText>
                <View className="flex-row items-center gap-2 rounded-md bg-success/10 px-3 py-1.5">
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <AppText tone="success" size="xs" weight="semibold">
                    Applied for {myApplication.role.replace(/_/g, " ")}
                  </AppText>
                </View>
              </View>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setApplyExpanded((current) => !current)}
                  className="flex-row items-center justify-between"
                >
                  <AppText weight="bold">Apply to join</AppText>
                  <Feather name={applyExpanded ? "chevron-up" : "chevron-down"} size={iconSize.md} color={colors.text} />
                </Pressable>

                {applyExpanded ? (
                  <>
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
                  </>
                ) : null}
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
};
