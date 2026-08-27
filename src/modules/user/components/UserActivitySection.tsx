import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ExpandableCaption } from "@/modules/post/components/ExpandableCaption";
import { PostMediaCarousel } from "@/modules/post/components/PostMediaCarousel";
import { Post } from "@/modules/post/types";
import { useUserPosts } from "@/modules/user/hooks/useUserPosts";

type UserActivitySectionProps = {
  userId: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

const ActivityCard = ({ post }: { post: Post }) => {
  return (
    <View className="rounded-md border border-border bg-background p-4">
      <View className="flex-row items-center justify-between gap-2">
        <AppText tone="primary" size="xs" weight="semibold">
          {post.category || "Update"}
        </AppText>
        <AppText tone="muted" size="xs">
          {formatDate(post.createdAt)}
        </AppText>
      </View>

      {post.content ? (
        <View className="mt-2">
          <ExpandableCaption text={post.content} />
        </View>
      ) : null}

      {post.media?.length ? (
        <View className="mt-3 overflow-hidden rounded-md">
          <PostMediaCarousel postId={post.id} media={post.media} />
        </View>
      ) : null}

      {post.linkUrl ? (
        <AppText tone="primary" size="sm" className="mt-2">
          {post.linkUrl}
        </AppText>
      ) : null}
    </View>
  );
};

export const UserActivitySection = ({ userId }: UserActivitySectionProps) => {
  const colors = useThemeTokens();
  const { posts, isLoading, errorMessage } = useUserPosts(userId);

  return (
    <View className="rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Feather name="activity" size={18} color={colors.primary} />
        <AppText weight="bold">Activity</AppText>
      </View>

      <View className="mt-4 gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </>
        ) : errorMessage ? (
          <AppText tone="muted" size="sm">
            {errorMessage}
          </AppText>
        ) : posts.length === 0 ? (
          <AppText tone="muted" size="sm">
            No public activity yet.
          </AppText>
        ) : (
          posts.map((post) => <ActivityCard key={post.id} post={post} />)
        )}
      </View>
    </View>
  );
};
