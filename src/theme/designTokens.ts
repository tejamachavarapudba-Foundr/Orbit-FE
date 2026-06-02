/** Design tokens aligned with Lovable (loveble_UI) — visual constants only. */

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32
} as const;

export const iconSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
} as const;

/** Lucide icon name → Feather glyph name (for @expo/vector-icons). */
export const lucideToFeather: Record<string, string> = {
  Home: "home",
  MessageSquare: "message-square",
  Briefcase: "briefcase",
  Calendar: "calendar",
  Rocket: "send",
  Sparkles: "star",
  Send: "send",
  Heart: "heart",
  Trash2: "trash-2",
  Compass: "compass",
  Users: "users",
  LogOut: "log-out",
  User: "user",
  Plus: "plus"
};

export type BadgeCategory =
  | "Update"
  | "Announcement"
  | "Milestone"
  | "Launch"
  | "Hiring"
  | "Service"
  | "Marketing"
  | "Other"
  | "Advertisement"
  | "Query"
  | "Funding";

/** Per-category badge surface (light + dark). */
export const categoryBadgeClass: Record<BadgeCategory, string> = {
  Update: "border-blue-500/25 bg-blue-500/10 dark:border-blue-400/30 dark:bg-blue-500/20",
  Announcement: "border-purple-500/25 bg-purple-500/10 dark:border-purple-400/30 dark:bg-purple-500/20",
  Milestone: "border-emerald-500/25 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/20",
  Launch: "border-orange-500/25 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-500/20",
  Hiring: "border-emerald-600/25 bg-emerald-600/10 dark:border-emerald-300/30 dark:bg-emerald-600/20",
  Service: "border-cyan-500/25 bg-cyan-500/10 dark:border-cyan-400/30 dark:bg-cyan-500/20",
  Marketing: "border-pink-500/25 bg-pink-500/10 dark:border-pink-400/30 dark:bg-pink-500/20",
  Advertisement: "border-red-500/25 bg-red-500/10 dark:border-red-400/30 dark:bg-red-500/20",
  Query: "border-indigo-500/25 bg-indigo-500/10 dark:border-indigo-400/30 dark:bg-indigo-500/20",
  Funding: "border-amber-500/25 bg-amber-500/10 dark:border-amber-400/30 dark:bg-amber-500/20",
  Other: "border-gray-500/25 bg-gray-500/10 dark:border-gray-400/30 dark:bg-gray-500/20"
};

export const categoryBadgeTextClass: Record<BadgeCategory, string> = {
  Update: "text-blue-700 dark:text-blue-300",
  Announcement: "text-purple-700 dark:text-purple-300",
  Milestone: "text-emerald-700 dark:text-emerald-300",
  Launch: "text-orange-700 dark:text-orange-300",
  Hiring: "text-emerald-800 dark:text-emerald-300",
  Service: "text-cyan-700 dark:text-cyan-300",
  Marketing: "text-pink-700 dark:text-pink-300",
  Advertisement: "text-red-700 dark:text-red-300",
  Query: "text-indigo-700 dark:text-indigo-300",
  Funding: "text-amber-700 dark:text-amber-300",
  Other: "text-gray-700 dark:text-gray-300"
};

const badgeCategorySet = new Set<string>(Object.keys(categoryBadgeClass));

export const toBadgeCategory = (category: string): BadgeCategory | undefined => {
  if (badgeCategorySet.has(category)) {
    return category as BadgeCategory;
  }

  const normalized =
    category.length > 0 ? `${category.charAt(0).toUpperCase()}${category.slice(1).toLowerCase()}` : category;

  if (badgeCategorySet.has(normalized)) {
    return normalized as BadgeCategory;
  }

  return undefined;
};
