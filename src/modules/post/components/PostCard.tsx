import { memo, useCallback, useState } from "react";
import { Alert, Linking, Pressable, Share, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { CommentsModal } from "@/modules/comments/components/CommentsModal";
import { usePostComments } from "@/modules/comments/hooks";
import { usePostLikes } from "@/modules/likes/hooks";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { ExpandableCaption } from "@/modules/post/components/ExpandableCaption";
import { PostMediaCarousel } from "@/modules/post/components/PostMediaCarousel";
import { postCategoryOptions, usePostActions } from "@/modules/post/hooks";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { Post, PostCategory } from "@/modules/post/types";
import { iconSize, toBadgeCategory } from "@/theme/designTokens";

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

export const PostCard = memo(({ post }: PostCardProps) => {
  const colors = useThemeTokens();
  const { currentUserId, isSubmitting, deletingPostId, updatePost, deletePost } = usePostActions();
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
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftCategory, setDraftCategory] = useState<PostCategory>(
    postCategoryOptions.some((option) => option.value === post.category) ? (post.category as PostCategory) : "Update"
  );
  const isOwnPost = currentUserId === post.author?.id;
  const authorName = post.author?.fullName ??  "Unknown";
  const authorRole = post.author?.headline ??  "";
  const isDeleting = deletingPostId === post.id;

  const categoryLabel =
  postCategoryOptions.find(
    option => option.value === post.category
  )?.label ?? post.category;

  const categoryBadge = toBadgeCategory(post.category);
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
      title: "Startuphouze post",
      message: message || "Startuphouze post",
      url: post.linkUrl || undefined
    });
  }, [post.content, post.linkUrl]);

  return (
    <View className="bg-card">
      <View className="px-4 pb-0 pt-3">
        <View className="flex-row items-start gap-3">
          <Avatar name={authorName} imageUrl={post.author.avatarUrl} size="md" fallback="mesh" />
          <View className="min-w-0 flex-1 pr-24">
            <AppText weight="medium" numberOfLines={1}>
              {authorName}
            </AppText>
            <AppText tone="muted" size="xs" className="mt-0.5" numberOfLines={1}>
              {authorRole}
            </AppText>
            <AppText tone="muted" size="xs" className="mt-0.5">
              {formatRelativeTime(post.createdAt)}
            </AppText>
          </View>
          <View className="absolute right-0 top-0 items-end">
            {categoryBadge ? (
              <Badge label={categoryLabel} variant="outline" category={categoryBadge} />
            ) : (
              <Badge label={categoryLabel} variant="outline" />
            )}
          </View>
        </View>
      </View>

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
        ) : (
          <>
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
          </>
        )}

        {!isEditing ? (
          <>
            <View className="flex-row items-center justify-between pt-1">
              <View className="flex-row items-center">
                <Pressable
                  accessibilityRole="button"
                  disabled={isMutating}
                  onPress={() => void toggleLike()}
                  hitSlop={actionHitSlop}
                  className="h-9 flex-row items-center justify-center gap-1.5 rounded-md px-2"
                >
                  <Feather name="heart" size={iconSize.md} color={isLikedByMe ? "#ef4444" : colors.text} />
                  <AppText size="sm" weight="medium">
                    {likesCount}
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowComments(true)}
                  hitSlop={actionHitSlop}
                  className="h-9 flex-row items-center justify-center gap-1.5 rounded-md px-2"
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
              </View>

              <View className="flex-row items-center gap-1">
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
            </View>
            <CommentsModal
              visible={showComments}
              onClose={() => setShowComments(false)}
              postId={post.id}
              initialComments={post.comments}
            />
          </>
        ) : null}
      </CardContent>
    </View>
  );
});

PostCard.displayName = "PostCard";
