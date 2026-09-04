import { Project } from "@/modules/project/types";

export type ProjectBadge = "New" | "Trending" | "Best liked" | "Viewed";

// Single badge per card, matching whichever sort bucket it landed in below —
// showing every qualifying label at once (e.g. "Trending" + "Viewed"
// together) got cluttered, and this way the badge visually explains why
// the card is positioned where it is.
export const getProjectBadge = (project: Project, isTrending: boolean, isBestLiked: boolean): ProjectBadge => {
  if (!project.isViewedByMe) return "New";
  if (isTrending) return "Trending";
  if (isBestLiked) return "Best liked";
  return "Viewed";
};

// Cascade: unviewed always sorts first regardless of trending/liked status;
// a *viewed* startup can still rank ahead of "plain viewed" ones by being
// trending or best-liked — only falls to the bottom bucket if it's neither.
export const getSortPriority = (project: Project, isTrending: boolean, isBestLiked: boolean): number => {
  if (!project.isViewedByMe) return 0;
  if (isTrending) return 1;
  if (isBestLiked) return 2;
  return 3;
};

// Top-liked startups, out of whatever's currently loaded — no dedicated
// backend ranking for this exists (unlike Trending, which reuses the real
// /startups/trending algorithm), so this is a simple client-side heuristic:
// anything past the "best liked" threshold (more than 10 likes), ranked
// by like count, capped to `limit`.
export const getBestLikedIds = (projects: Project[], limit = 3): Set<string> => {
  const liked = projects
    .filter((project) => (project.likeCount ?? 0) > 10)
    .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, limit);
  return new Set(liked.map((project) => project.id));
};
