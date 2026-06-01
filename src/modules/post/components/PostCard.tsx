import { memo, useCallback, useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Share, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { CommentsPanel } from "@/modules/comments/components/CommentsPanel";
import { usePostComments } from "@/modules/comments/hooks";
import { usePostLikes } from "@/modules/likes/hooks";
import { postCategoryOptions, usePostActions } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";
import { BadgeCategory } from "@/theme/designTokens";

type PostCardProps = {
  post: Post;
};

const badgeCategories = new Set<BadgeCategory>([
  "update",
  "announcement",
  "milestone",
  "launch",
  "hiring",
  "ad",
  "question",
  "funding"
]);

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
  const currentUser = useAuthStore((state) => state.user);
  const { currentUserId, isSubmitting, deletingPostId, updatePost, deletePost } = usePostActions();
  const { likesCount, isLikedByMe, isMutating, toggleLike } = usePostLikes(post.id);
  const { commentsCount } = usePostComments(post.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const [draftCategory, setDraftCategory] = useState<PostCategory>(
    postCategoryOptions.some((option) => option.value === post.category) ? (post.category as PostCategory) : "update"
  );
  const isOwnPost = currentUserId === post.authorId;
  const authorName = isOwnPost ? currentUser?.profile.fullName || "You" : `Member ${post.authorId.slice(0, 8)}`;
  const isDeleting = deletingPostId === post.id;

  const categoryLabel = useMemo(() => {
    const match = postCategoryOptions.find((option) => option.value === post.category);
    return match?.label ?? post.category;
  }, [post.category]);

  const categoryBadge = badgeCategories.has(post.category as BadgeCategory)
    ? (post.category as BadgeCategory)
    : undefined;

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
      title: "Foundr post",
      message: message || "Foundr post",
      url: post.linkUrl || undefined
    });
  }, [post.content, post.linkUrl]);

  return (
    <Card className="overflow-hidden">
      <View className="flex-row items-start gap-3 p-4 pb-0">
        <Avatar name={authorName} imageUrl="" size="md" fallback="mesh" />
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText weight="medium">{authorName}</AppText>
            {categoryBadge ? (
              <Badge label={categoryLabel} variant="outline" category={categoryBadge} />
            ) : (
              <Badge label={categoryLabel} variant="outline" />
            )}
          </View>
          <AppText tone="muted" size="xs" className="mt-0.5">
            {formatRelativeTime(post.createdAt)}
          </AppText>
        </View>
        {isOwnPost && !isEditing ? (
          <Pressable
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={confirmDelete}
            className="h-8 w-8 items-center justify-center rounded-md"
          >
            <Feather name="trash-2" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <CardContent className="gap-3 pt-3">
        {isEditing ? (
          <View>
            <TextInput
              value={draftContent}
              onChangeText={setDraftContent}
              placeholder="Update your post"
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              multiline
              textAlignVertical="top"
              className="min-h-24 rounded-md border border-input bg-background px-3 py-3 text-sm text-text"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 max-h-10">
              <View className="flex-row">
                {postCategoryOptions.map((option) => {
                  const isActive = draftCategory === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => setDraftCategory(option.value)}
                      className={`mr-2 h-9 justify-center rounded-md border px-3 ${
                        isActive ? "border-primary bg-primary" : "border-border bg-background"
                      }`}
                    >
                      <AppText tone={isActive ? "onPrimary" : "muted"} size="sm" weight="medium">
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View className="mt-4 flex-row gap-3">
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
            <AppText size="sm" className="leading-relaxed">
              {post.content}
            </AppText>
            {post.imageUrl ? (
              post.mediaType === "video" ? (
                <View className="max-h-80 w-full overflow-hidden rounded-lg border border-border bg-black">
                  <AppText tone="muted" size="sm" className="p-4 text-center">
                    Video: {post.imageUrl}
                  </AppText>
                </View>
              ) : (
                <Image
                  source={{ uri: post.imageUrl }}
                  className="max-h-96 w-full rounded-lg border border-border bg-black"
                  resizeMode="cover"
                />
              )
            ) : null}
            {post.linkUrl ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL(post.linkUrl)}
                className="flex-row items-center gap-2 rounded-lg border border-border bg-muted-bg p-3"
              >
                <Feather name="link" size={16} color={colors.muted} />
                <AppText size="sm" className="flex-1" numberOfLines={1}>
                  {post.linkUrl}
                </AppText>
              </Pressable>
            ) : null}
          </>
        )}

        {isOwnPost && !isEditing ? (
          <View className="flex-row gap-2 border-t border-border pt-3">
            <AppButton label="Edit" variant="outline" size="sm" onPress={() => setIsEditing(true)} className="flex-1" />
          </View>
        ) : null}

        {!isEditing ? (
          <>
            <View className="flex-row items-center gap-1 border-t border-border pt-2">
              <Pressable
                accessibilityRole="button"
                disabled={isMutating}
                onPress={() => void toggleLike()}
                className="flex-row items-center gap-1.5 rounded-md px-2 py-1.5"
              >
                <Feather name="heart" size={16} color={isLikedByMe ? "#ef4444" : colors.text} />
                <AppText size="sm" weight="medium">
                  {likesCount}
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setShowComments((current) => !current)}
                className="flex-row items-center gap-1.5 rounded-md px-2 py-1.5"
              >
                <Feather name="message-circle" size={16} color={colors.text} />
                <AppText size="sm" weight="medium">
                  {commentsCount}
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => void sharePost()}
                className="flex-row items-center gap-1.5 rounded-md px-2 py-1.5"
              >
                <Feather name="share-2" size={16} color={colors.text} />
                <AppText size="sm" weight="medium">
                  Share
                </AppText>
              </Pressable>
            </View>
            {showComments ? <CommentsPanel postId={post.id} /> : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
});

PostCard.displayName = "PostCard";
