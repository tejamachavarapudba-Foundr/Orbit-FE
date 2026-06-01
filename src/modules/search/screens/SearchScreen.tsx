import { Pressable, ScrollView, TextInput, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { searchTypeOptions, useGlobalSearch } from "@/modules/search/hooks";
import { SearchResultCard } from "@/modules/search/components/SearchResultCard";

export const SearchScreen = () => {
  const colors = useThemeTokens();
  const { query, type, results, totalCount, isLoading, errorMessage, setQuery, setType, search, clear } = useGlobalSearch();
  const showHint = query.trim().length < 2 && type === "all";

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <View className="w-full max-w-3xl self-center pt-8">
          <AppText size="2xl" weight="bold">
            Search
          </AppText>
          <AppText tone="muted" className="mt-2 leading-6">
            Find people, projects, jobs, events and posts across Startuphouze.
          </AppText>

          <View className="mt-6 rounded-md border border-border bg-surface px-4 shadow-sm">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search ai, founders, projects..."
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => void search()}
              className="h-14 text-base text-text"
            />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {searchTypeOptions.map((option) => {
              const isActive = type === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => setType(option.value)}
                  className={`rounded-md border px-4 py-2 ${isActive ? "border-primary bg-primary" : "border-border bg-surface"}`}
                >
                  <AppText tone={isActive ? "onPrimary" : "muted"} weight="medium">
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-4 flex-row gap-3">
            <AppButton label="Search" onPress={() => void search()} className="h-10 flex-1" />
            <AppButton label="Clear" variant="outline" onPress={clear} className="h-10 flex-1" />
          </View>

          {isLoading ? (
            <View className="mt-8 gap-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </View>
          ) : errorMessage ? (
            <View className="mt-8">
              <ErrorState message={errorMessage} onRetry={() => void search()} />
            </View>
          ) : showHint ? (
            <View className="mt-10">
              <EmptyState title="Search Startuphouze" message="Type at least two letters, then choose a result type or search across everything." />
            </View>
          ) : totalCount === 0 ? (
            <View className="mt-10">
              <EmptyState title="No results found" message="Try another keyword or switch to All." />
            </View>
          ) : (
            <View className="mt-8 gap-6">
              <AppText tone="muted" size="sm">
                {totalCount} results found
              </AppText>

              {results.users.length > 0 ? (
                <View className="gap-3">
                  <AppText weight="bold" size="lg">
                    Users
                  </AppText>
                  {results.users.map((item) => (
                    <SearchResultCard key={item.id} kind="user" item={item} />
                  ))}
                </View>
              ) : null}

              {results.projects.length > 0 ? (
                <View className="gap-3">
                  <AppText weight="bold" size="lg">
                    Projects
                  </AppText>
                  {results.projects.map((item) => (
                    <SearchResultCard key={item.id} kind="project" item={item} />
                  ))}
                </View>
              ) : null}

              {results.posts.length > 0 ? (
                <View className="gap-3">
                  <AppText weight="bold" size="lg">
                    Posts
                  </AppText>
                  {results.posts.map((item) => (
                    <SearchResultCard key={item.id} kind="post" item={item} />
                  ))}
                </View>
              ) : null}

              {results.jobs.length > 0 ? (
                <View className="gap-3">
                  <AppText weight="bold" size="lg">
                    Jobs
                  </AppText>
                  {results.jobs.map((item) => (
                    <SearchResultCard key={item.id} kind="job" item={item} />
                  ))}
                </View>
              ) : null}

              {results.events.length > 0 ? (
                <View className="gap-3">
                  <AppText weight="bold" size="lg">
                    Events
                  </AppText>
                  {results.events.map((item) => (
                    <SearchResultCard key={item.id} kind="event" item={item} />
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
};
