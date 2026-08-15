import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { AppText } from "@/components/ui/AppText";

type Segment = {
  label: string;
  value: number;
  color: string;
};

type OwnershipPieChartProps = {
  founderOwnership: number;
  employeeEsop: number;
  investorOwnership: number;
  availablePool: number;
  size?: number;
};

const SEGMENT_COLORS = {
  founder: "#3b82f6",
  esop: "#a855f7",
  investor: "#f59e0b",
  pool: "#10b981",
};

export const OwnershipPieChart = ({
  founderOwnership,
  employeeEsop,
  investorOwnership,
  availablePool,
  size = 160,
}: OwnershipPieChartProps) => {
  const segments: Segment[] = [
    { label: "Founder", value: Math.max(0, founderOwnership), color: SEGMENT_COLORS.founder },
    { label: "ESOP", value: Math.max(0, employeeEsop), color: SEGMENT_COLORS.esop },
    { label: "Investor", value: Math.max(0, investorOwnership), color: SEGMENT_COLORS.investor },
    { label: "Pool", value: Math.max(0, availablePool), color: SEGMENT_COLORS.pool },
  ];

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = size / 2;
  const strokeWidth = size * 0.22;
  const circleRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * circleRadius;

  let cumulativePercent = 0;

  return (
    <View className="flex-row items-center gap-4">
      <Svg width={size} height={size}>
        <G rotation={-90} originX={radius} originY={radius}>
          {total === 0 ? (
            <Circle
              cx={radius}
              cy={radius}
              r={circleRadius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : (
            segments
              .filter((segment) => segment.value > 0)
              .map((segment) => {
                const fraction = segment.value / total;
                const dashLength = circumference * fraction;
                const dashOffset = circumference * (1 - cumulativePercent);
                cumulativePercent += fraction;

                return (
                  <Circle
                    key={segment.label}
                    cx={radius}
                    cy={radius}
                    r={circleRadius}
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={dashOffset}
                    fill="none"
                  />
                );
              })
          )}
        </G>
      </Svg>

      <View className="gap-2">
        {segments.map((segment) => (
          <View key={segment.label} className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <AppText size="sm" tone="muted">
              {segment.label}: {segment.value}%
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};
