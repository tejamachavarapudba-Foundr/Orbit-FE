import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// A distinct 2-color gradient per platform/category, so cards look
// intentional even before a founder uploads a real cover photo.
const GRADIENTS: Record<string, [string, string]> = {
  saas: ["#6366f1", "#3b82f6"],
  marketplace: ["#f97316", "#f59e0b"],
  consumer_app: ["#ec4899", "#f472b6"],
  mobile_app: ["#8b5cf6", "#a78bfa"],
  hardware: ["#64748b", "#94a3b8"],
  ai_ml: ["#06b6d4", "#3b82f6"],
  fintech: ["#10b981", "#059669"],
  healthtech: ["#ef4444", "#f87171"],
  edtech: ["#eab308", "#facc15"],
  climate: ["#22c55e", "#16a34a"],
  deeptech: ["#4f46e5", "#7c3aed"],
  web3: ["#a855f7", "#d946ef"],
  ecommerce: ["#f43f5e", "#fb7185"],
  social: ["#0ea5e9", "#38bdf8"],
  developer_tools: ["#334155", "#64748b"],
  enterprise: ["#1e40af", "#3b82f6"],
  creator_economy: ["#db2777", "#f472b6"],
  agency: ["#7c2d12", "#c2410c"],
  nonprofit: ["#0d9488", "#14b8a6"],
  mobility: ["#0369a1", "#0ea5e9"]
};

const DEFAULT_GRADIENT: [string, string] = ["#2563eb", "#60a5fa"];

type ProjectBannerGradientProps = {
  projectType: string;
  height: number;
};

export const ProjectBannerGradient = ({ projectType, height }: ProjectBannerGradientProps) => {
  const [from, to] = GRADIENTS[projectType] ?? DEFAULT_GRADIENT;
  const gradientId = `project-banner-${projectType || "default"}`;

  return (
    <Svg width="100%" height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
};
