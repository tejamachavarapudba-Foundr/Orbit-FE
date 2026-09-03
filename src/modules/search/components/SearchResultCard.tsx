import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Post } from "@/modules/post/types";
import { Project } from "@/modules/project/types";
import { SearchEvent, SearchJob, SearchUser } from "@/modules/search/types";
import { UserAvatar } from "@/modules/user/components/UserAvatar";

type SearchResultCardProps =
  | { kind: "user"; item: SearchUser }
  | { kind: "project"; item: Project }
  | { kind: "job"; item: SearchJob }
  | { kind: "event"; item: SearchEvent }
  | { kind: "post"; item: Post };

const pillText = (value?: string) => (value ? value.replace(/_/g, " ") : "startup");

const getGenericTitle = (item: SearchJob | SearchEvent) => {
  if ("title" in item && item.title) {
    return item.title;
  }

  if ("name" in item && item.name) {
    return item.name;
  }

  return "Result";
};

export const SearchResultCard = ({ kind, item }: SearchResultCardProps) => {
  if (kind === "user") {
    return (
      <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
        <View className="flex-row gap-3">
          <UserAvatar name={item.profile.fullName} imageUrl={item.profile.avatarUrl} />
          <View className="flex-1">
            <AppText weight="bold" size="lg">
              {item.profile.fullName || "Orbit member"}
            </AppText>
            <AppText tone="primary" weight="medium" className="mt-1">
              {item.profile.headline || item.profile.role || "Member"}
            </AppText>
            <AppText tone="muted" size="sm" className="mt-2">
              {item.profile.company || item.profile.location || item.email}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  if (kind === "project") {
    return (
      <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
        <View className="flex-row gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-md bg-primary">
            <AppText tone="onPrimary" weight="bold">
              {(item.name || "S").charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View className="flex-1">
            <View className="flex-row items-start gap-3">
              <AppText weight="bold" size="lg" className="flex-1">
                {item.name || "Untitled project"}
              </AppText>
              <View className="rounded-md bg-primary/10 px-3 py-1">
                <AppText tone="primary" size="sm" weight="semibold">
                  {pillText(item.projectType)}
                </AppText>
              </View>
            </View>
            <AppText tone="primary" weight="medium" className="mt-1">
              {item.tagline || item.stage || "Startup"}
            </AppText>
            <AppText className="mt-3 leading-5" numberOfLines={2}>
              {item.description || item.pitch || "No description yet."}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  if (kind === "post") {
    return (
      <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
        <View className="rounded-md bg-primary/10 px-3 py-1 self-start">
          <AppText tone="primary" size="sm" weight="semibold">
            {item.category}
          </AppText>
        </View>
        <AppText className="mt-3 leading-5" numberOfLines={3}>
          {item.content}
        </AppText>
      </View>
    );
  }

  return (
    <View className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <AppText weight="bold" size="lg">
        {getGenericTitle(item)}
      </AppText>
      <AppText tone="muted" className="mt-2" numberOfLines={2}>
        {"description" in item ? item.description || item.location || "No description yet." : "No description yet."}
      </AppText>
    </View>
  );
};
