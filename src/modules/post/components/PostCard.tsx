import { memo, useCallback, useState } from "react";
import { Alert, Linking, Modal, Pressable, Share, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useCommentsSheetStore } from "@/modules/comments/commentsSheetStore";
import { usePostComments } from "@/modules/comments/hooks";
import { useFollowAction } from "@/modules/follows/hooks";
import { FollowProfile } from "@/modules/follows/types";
import { usePostLikes } from "@/modules/likes/hooks";
import { postApi } from "@/modules/post/api";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { ExpandableCaption } from "@/modules/post/components/ExpandableCaption";
import { PostMediaCarousel } from "@/modules/post/components/PostMediaCarousel";
import { postCategoryOptions, usePostActions } from "@/modules/post/hooks";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { Post, PostCategory } from "@/modules/post/types";
import { useOpenUserProfile } from "@/modules/user/hooks/useOpenUserProfile";
import { FullPhotoModal } from "@/components/ui/FullPhotoModal";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useToastStore } from "@/store/toastStore";
import { iconSize } from "@/theme/designTokens";

type PostCardProps = {
  post: Post;
};

const actionHitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

const formatRelativeTime = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date));
};

// The follow store only reads .id/.fullName off this — the rest is display
// data for its own local "following" list, so blanks here are harmless.
const toFollowProfile = (author: Post["author"]): FollowProfile => ({
  id: author.id,
  fullName: author.fullName,
  headline: author.headline,
  bio: "",
  role: "",
  location: "",
  language: [],
  company: "",
  website: "",
  linkedinUrl: "",
  skills: [],
  lookingFor: [],
  openToConnect: false,
  avatarUrl: author.avatarUrl,
  createdAt: "",
  updatedAt: ""
});

export const PostCard = memo(({ post }: PostCardProps) => {
  const colors = useThemeTokens();
  const openUserProfile = useOpenUserProfile();
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isHiddenLocally, setIsHiddenLocally] = useState(false);
  const showToast = useToastStore((state) => state.show);
  const { isSubmitting, deletingPostId, updatePost, deletePost } = usePostActions();
  const {
    likesCount,
    isLikedByMe,
    isMutating,
    toggleLike,
  } = usePostLikes(
    post.id,
    post.likes,
  );

  const { commentsCount } = usePostComments(post.id, post.comments);
  const isSaved = useSavedPostsStore((state) => state.savedPostIds.has(post.id));
  const toggleSaved = useSavedPostsStore((state) => state.toggleSaved);
  const { isSelf: isOwnPost, isFollowing, isMutating: isFollowMutating, toggleFollow } = useFollowAction(
    toFollowProfile(post.author)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftCategory, setDraftCategory] = useState<PostCategory>(
    postCategoryOptions.some((option) => option.value === post.category) ? (post.category as PostCategory) : "Update"
  );
  const authorName = post.author?.fullName ??  "Unknown";
  const authorRole = post.author?.headline ??  "";
  const isDeleting = deletingPostId === post.id;

  const hasMedia = post.media && post.media.length > 0;
  const submitEdit = useCallback(async () => {
    const didSucceed = await updatePost(post.id, {
      content: draftContent.trim(),
      category: draftCategory
    });

    if (didSucceed) {
      setIsEditing(false);
    }
  }, [draftCategory, draftContent, post.id, updatePost]);

  const confirmDelete = useCallback(() => {
    Alert.alert("Delete post", "This post will be permanently removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deletePost(post.id) }
    ]);
  }, [deletePost, post.id]);

  const sharePost = useCallback(async () => {
    const message = [post.content, post.linkUrl].filter(Boolean).join("\n\n");
    await Share.share({
      title: "Orbit post",
      message: message || "Orbit post",
      url: post.linkUrl || undefined
    });
  }, [post.content, post.linkUrl]);

  const handleFollowPillPress = useCallback(() => {
    if (isFollowing) {
      setShowUnfollowConfirm(true);
    } else {
      void toggleFollow();
    }
  }, [isFollowing, toggleFollow]);

  const confirmUnfollow = useCallback(() => {
    setShowUnfollowConfirm(false);
    void toggleFollow();
  }, [toggleFollow]);

  const handleInterested = useCallback(() => {
    setIsMenuVisible(false);
    showToast({ type: "success", title: "Thanks — we'll show more like this." });
  }, [showToast]);

  const handleNotInterested = useCallback(() => {
    setIsMenuVisible(false);
    void postApi
      .markNotInterested(post.id)
      .then(() => setIsHiddenLocally(true))
      .catch(() => showToast({ type: "error", title: "Couldn't hide that post", message: "Try again." }));
  }, [post.id, showToast]);

  const handleCopyLink = useCallback(() => {
    setIsMenuVisible(false);
    void Clipboard.setStringAsync(`https://startuphouze.com/p/${post.id}`).then(() =>
      showToast({ type: "success", title: "Link copied" })
    );
  }, [post.id, showToast]);

  const handleReport = useCallback(() => {
    setIsMenuVisible(false);
    Alert.alert("Report post", "Report this post for review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () =>
          void postApi
            .reportPost(post.id, "")
            .then(() => showToast({ type: "success", title: "Post reported", message: "Thanks for letting us know." }))
            .catch(() => showToast({ type: "error", title: "Couldn't report that post", message: "Try again." }))
      }
    ]);
  }, [post.id, showToast]);

  if (isHiddenLocally) {
    return null;
  }

  return (
    <View className="bg-card">
      <View className="px-4 pb-0 pt-3">
        <View className="flex-row items-start gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${authorName}'s photo`}
            onPress={() => (post.author.avatarUrl ? setShowFullPhoto(true) : openUserProfile(post.author.id))}
          >
            <Avatar name={authorName} imageUrl={post.author.avatarUrl} size="md" fallback="mesh" className="h-12 w-12" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => openUserProfile(post.author.id)}
            className="min-w-0 flex-1 pr-28"
          >
            <View className="flex-row items-center gap-1.5">
              <AppText weight="medium" numberOfLines={1}>
                {authorName}
              </AppText>
              {post.author?.identityVerified ? <VerifiedBadge /> : null}
            </View>
            <AppText tone="muted" size="xs" className="mt-0.5" numberOfLines={1}>
              {authorRole}
            </AppText>
            <AppText tone="muted" size="xs" className="mt-0.5">
              {formatRelativeTime(post.createdAt)}
            </AppText>
          </Pressable>
          <View className="absolute right-0 top-0 flex-row items-center gap-1.5">
            {!isOwnPost ? (
              <Pressable
                accessibilityRole="button"
                disabled={isFollowMutating}
                onPress={handleFollowPillPress}
                hitSlop={actionHitSlop}
                className={`h-7 flex-row items-center gap-1 rounded-full border px-2.5 ${
                  isFollowing ? "border-border" : "border-primary"
                }`}
              >
                <Feather name={isFollowing ? "check" : "plus"} size={12} color={isFollowing ? colors.muted : colors.primary} />
                <AppText tone={isFollowing ? "muted" : "primary"} size="xs" weight="semibold">
                  {isFollowing ? "Following" : "Follow"}
                </AppText>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post options"
              onPress={() => setIsMenuVisible(true)}
              hitSlop={actionHitSlop}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <Feather name="more-horizontal" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      </View>

      {!isEditing ? (
        <View className="gap-3 px-4 pt-2">
          <ExpandableCaption text={post.content} />
          {post.linkUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(post.linkUrl)}
              className="flex-row items-center gap-2 rounded-lg border border-border bg-muted-bg p-3"
            >
              <Feather name="link" size={iconSize.md} color={colors.muted} />
              <AppText size="sm" className="flex-1" numberOfLines={1}>
                {post.linkUrl}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isEditing && hasMedia ? (
        <View className="mt-3 w-full">
          <PostMediaCarousel postId={post.id} media={post.media} />
        </View>
      ) : null}

      <CardContent className="gap-3 px-4 pb-4 pt-3">
        {isEditing ? (
          <View className="gap-3">
            <TextInput
              value={draftContent}
              onChangeText={setDraftContent}
              placeholder="Update your post"
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              multiline
              textAlignVertical="top"
              className="min-h-24 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
            />
            <View>
              <AppText tone="muted" size="xs" weight="medium" className="mb-2">
                Category
              </AppText>
              <CategoryDropdown
                value={draftCategory}
                options={postCategoryOptions}
                onChange={setDraftCategory}
                accessibilityLabel="Edit post category"
              />
            </View>
            <View className="flex-row gap-3">
              <AppButton
                label="Save"
                loading={isSubmitting}
                disabled={!draftContent.trim()}
                onPress={() => void submitEdit()}
                className="flex-1"
                size="default"
              />
              <AppButton label="Cancel" variant="outline" onPress={() => setIsEditing(false)} className="flex-1" size="default" />
            </View>
          </View>
        ) : null}

        {!isEditing ? (
          <>
            <View className="flex-row items-center pt-1">
              <Pressable
                accessibilityRole="button"
                disabled={isMutating}
                onPress={() => void toggleLike()}
                hitSlop={actionHitSlop}
                className="h-9 flex-row items-center gap-1.5 rounded-md px-2"
              >
                <Feather name="thumbs-up" size={iconSize.md} color={isLikedByMe ? colors.primary : colors.text} />
                <AppText size="sm" weight="medium" tone={isLikedByMe ? "primary" : "default"}>
                  {likesCount}
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => useCommentsSheetStore.getState().open(post.id, post.comments)}
                hitSlop={actionHitSlop}
                className="h-9 flex-row items-center gap-1.5 rounded-md px-2"
              >
                <Feather name="message-circle" size={iconSize.md} color={colors.text} />
                <AppText size="sm" weight="medium">
                  {commentsCount}
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => void sharePost()}
                hitSlop={actionHitSlop}
                className="h-9 w-9 items-center justify-center rounded-md"
                accessibilityLabel="Share post"
              >
                <Feather name="send" size={iconSize.md} color={colors.text} />
              </Pressable>

              <View className="flex-1" />

              {isOwnPost ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setIsEditing(true)}
                    hitSlop={actionHitSlop}
                    className="h-9 w-9 items-center justify-center rounded-md"
                    accessibilityLabel="Edit post"
                  >
                    <Feather name="edit-2" size={iconSize.md} color={colors.text} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isDeleting}
                    onPress={confirmDelete}
                    hitSlop={actionHitSlop}
                    className="h-9 w-9 items-center justify-center rounded-md"
                    accessibilityLabel="Delete post"
                  >
                    <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
                  </Pressable>
                </>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() => void toggleSaved(post.id)}
                hitSlop={actionHitSlop}
                className="h-9 w-9 items-center justify-center rounded-md"
                accessibilityLabel={isSaved ? "Remove from saved" : "Save post"}
              >
                <Feather name="bookmark" size={iconSize.md} color={isSaved ? colors.primary : colors.text} />
              </Pressable>
            </View>
          </>
        ) : null}
      </CardContent>
      {post.author.avatarUrl ? (
        <FullPhotoModal visible={showFullPhoto} imageUrl={post.author.avatarUrl} onClose={() => setShowFullPhoto(false)} />
      ) : null}
      {showUnfollowConfirm ? (
        <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowUnfollowConfirm(false)}>
          <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShowUnfollowConfirm(false)}>
            <Pressable
              className="w-full rounded-t-2xl p-5"
              style={{ backgroundColor: colors.surface }}
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-3 items-center">
                <View className="h-1 w-10 rounded-full bg-border" />
              </View>
              <AppText size="lg" weight="bold">
                Unfollow {authorName}
              </AppText>
              <AppText tone="muted" className="mt-2 leading-6">
                Stop seeing activity from {authorName} on your feed. {authorName} won't be notified that you've unfollowed.
              </AppText>
              <View className="mt-5 flex-row gap-3">
                <AppButton label="Unfollow" onPress={confirmUnfollow} className="flex-1" />
                <AppButton label="Cancel" variant="outline" onPress={() => setShowUnfollowConfirm(false)} className="flex-1" />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <Modal visible={isMenuVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setIsMenuVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setIsMenuVisible(false)}>
          <Pressable style={{ backgroundColor: colors.surface }} className="rounded-t-2xl pb-2" onPress={(event) => event.stopPropagation()}>
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>
            <Pressable accessibilityRole="button" onPress={handleInterested} className="flex-row items-center gap-3 px-5 py-3.5">
              <Feather name="thumbs-up" size={iconSize.md} color={colors.text} />
              <AppText size="base">Interested</AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleNotInterested} className="flex-row items-center gap-3 px-5 py-3.5">
              <Feather name="eye-off" size={iconSize.md} color={colors.text} />
              <AppText size="base">Not interested</AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleCopyLink} className="flex-row items-center gap-3 px-5 py-3.5">
              <Feather name="link" size={iconSize.md} color={colors.text} />
              <AppText size="base">Copy link</AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handleReport} className="flex-row items-center gap-3 px-5 py-3.5">
              <Feather name="flag" size={iconSize.md} color={colors.danger} />
              <AppText size="base" tone="danger">
                Report post
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

PostCard.displayName = "PostCard";
