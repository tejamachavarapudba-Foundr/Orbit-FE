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
  | "update"
  | "announcement"
  | "milestone"
  | "launch"
  | "hiring"
  | "ad"
  | "question"
  | "funding";

/** Per-category badge classes (Lovable feed CATEGORY_STYLES). */
export const categoryBadgeClass: Record<BadgeCategory, string> = {
  update: "border-blue-500/20 bg-blue-500/10",
  announcement: "border-purple-500/20 bg-purple-500/10",
  milestone: "border-emerald-500/20 bg-emerald-500/10",
  launch: "border-orange-500/20 bg-orange-500/10",
  hiring: "border-pink-500/20 bg-pink-500/10",
  ad: "border-amber-500/20 bg-amber-500/10",
  question: "border-cyan-500/20 bg-cyan-500/10",
  funding: "border-indigo-500/20 bg-indigo-500/10"
};

export const categoryBadgeTextClass: Record<BadgeCategory, string> = {
  update: "text-blue-700",
  announcement: "text-purple-700",
  milestone: "text-emerald-700",
  launch: "text-orange-700",
  hiring: "text-pink-700",
  ad: "text-amber-700",
  question: "text-cyan-700",
  funding: "text-indigo-700"
};
