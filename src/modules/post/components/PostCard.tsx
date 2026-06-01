import { memo, useCallback, useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, Share, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { CommentsPanel } from "@/modules/comments/components/CommentsPanel";
import { usePostComments } from "@/modules/comments/hooks";
import { usePostLikes } from "@/modules/likes/hooks";
import { postCategoryOptions, usePostActions } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";

type PostCardProps = {
  post: Post;
};

const formatCategory = (category: string) =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));

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

  const initials = useMemo(
    () =>
      authorName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "SH",
    [authorName]
  );

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
    <View className="rounded-md border border-border bg-surface p-5 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <AppText tone="primary" weight="bold">
            {initials}
          </AppText>
        </View>
        <View className="flex-1">
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <AppText weight="bold">{authorName}</AppText>
              <AppText tone="muted" size="sm">
                {formatDate(post.createdAt)}
              </AppText>
            </View>
            <View className="rounded-md bg-primary/10 px-3 py-1">
              <AppText tone="primary" size="sm" weight="medium">
                {formatCategory(post.category).toLowerCase()}
              </AppText>
            </View>
          </View>

          {isEditing ? (
            <View className="mt-4">
              <TextInput
                value={draftContent}
                onChangeText={setDraftContent}
                placeholder="Update your post"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                multiline
                textAlignVertical="top"
                className="min-h-24 rounded-md border border-border bg-background px-4 py-3 text-base text-text"
              />
              <View className="mt-3 flex-row flex-wrap gap-y-2">
                {postCategoryOptions.map((option) => {
                  const isActive = draftCategory === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => setDraftCategory(option.value)}
                      className={`mr-2 rounded-md border px-3 py-2 ${
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
              <View className="mt-4 flex-row gap-3">
                <AppButton
                  label="Save"
                  loading={isSubmitting}
                  disabled={!draftContent.trim()}
                  onPress={() => void submitEdit()}
                  className="flex-1"
                />
                <AppButton label="Cancel" variant="outline" onPress={() => setIsEditing(false)} className="flex-1" />
              </View>
            </View>
          ) : (
            <>
              <AppText className="mt-4 leading-6">{post.content}</AppText>
              {post.linkUrl ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => void Linking.openURL(post.linkUrl)}
                  className="mt-4 rounded-md border border-border bg-background px-4 py-3"
                >
                  <AppText tone="primary" weight="medium">
                    link  {post.linkUrl}
                  </AppText>
                </Pressable>
              ) : null}
              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} className="mt-4 h-64 w-full rounded-md bg-background" resizeMode="cover" />
              ) : null}
            </>
          )}
        </View>
      </View>

      {isOwnPost && !isEditing ? (
        <View className="mt-4 flex-row gap-3 border-t border-border pt-4">
          <AppButton label="Edit" variant="outline" onPress={() => setIsEditing(true)} className="h-10 flex-1" />
          <AppButton
            label="Delete"
            variant="ghost"
            loading={isDeleting}
            onPress={confirmDelete}
            className="h-10 flex-1"
          />
        </View>
      ) : null}

      {!isEditing ? (
        <>
          <View className="mt-4 flex-row items-center gap-7 border-t border-border pt-4">
            <Pressable
              accessibilityRole="button"
              disabled={isMutating}
              onPress={() => void toggleLike()}
              className="flex-row items-center gap-2"
            >
              <AppText tone={isLikedByMe ? "danger" : "default"} size="xl">
                {isLikedByMe ? "♥" : "♡"}
              </AppText>
              <AppText weight="medium">{likesCount}</AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowComments((current) => !current)}
              className="flex-row items-center gap-2"
            >
              <AppText size="xl">○</AppText>
              <AppText weight="medium">{commentsCount}</AppText>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => void sharePost()} className="flex-row items-center gap-2">
              <AppText size="xl">↗</AppText>
              <AppText weight="semibold">Share</AppText>
            </Pressable>
          </View>
          {showComments ? <CommentsPanel postId={post.id} /> : null}
        </>
      ) : null}
    </View>
  );
});

PostCard.displayName = "PostCard";
