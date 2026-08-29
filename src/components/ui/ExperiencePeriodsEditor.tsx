import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import {
  calculateTotalExperienceLabel,
  emptyExperiencePeriod,
  ExperiencePeriod,
  MONTH_OPTIONS,
  YEAR_OPTIONS
} from "@/modules/profile/schemas/experience";

const MonthYearPicker = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
}) => {
  const [year, month] = value.split("-");

  return (
    <View className="gap-2">
      <AppText size="xs" tone="muted">
        {label}
      </AppText>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Dropdown value={month ?? ""} options={MONTH_OPTIONS} placeholder="Month" onChange={(m) => onChange(`${year ?? ""}-${m}`)} />
        </View>
        <View className="flex-1">
          <Dropdown value={year ?? ""} options={YEAR_OPTIONS} placeholder="Year" onChange={(y) => onChange(`${y}-${month ?? ""}`)} />
        </View>
      </View>
    </View>
  );
};

type ExperiencePeriodsEditorProps = {
  periods: ExperiencePeriod[];
  onChange: (periods: ExperiencePeriod[]) => void;
};

/** Collects one or more job date ranges (start mm/yy - end mm/yy) via
 * "+ Add experience", then surfaces only the summed total — the individual
 * ranges are never shown elsewhere, only used to compute that total. */
export const ExperiencePeriodsEditor = ({ periods, onChange }: ExperiencePeriodsEditorProps) => {
  const colors = useThemeTokens();

  const updateEntry = (index: number, patch: Partial<ExperiencePeriod>) => {
    onChange(periods.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(periods.filter((_, i) => i !== index));
  };

  const toggleCurrent = (index: number) => {
    const target = periods[index];
    if (!target) return;
    updateEntry(index, { isCurrent: !target.isCurrent, endDate: !target.isCurrent ? "" : target.endDate });
  };

  const total = calculateTotalExperienceLabel(periods);

  return (
    <View className="gap-3">
      {periods.map((entry, index) => (
        <Card key={index}>
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <AppText size="sm" tone="muted">
                Experience {index + 1}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => removeEntry(index)} hitSlop={8}>
                <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
              </Pressable>
            </View>
            <MonthYearPicker label="Start date" value={entry.startDate} onChange={(v) => updateEntry(index, { startDate: v })} />
            {!entry.isCurrent ? (
              <MonthYearPicker label="End date" value={entry.endDate} onChange={(v) => updateEntry(index, { endDate: v })} />
            ) : null}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: entry.isCurrent }}
              onPress={() => toggleCurrent(index)}
              className="flex-row items-center gap-2"
            >
              <Feather
                name={entry.isCurrent ? "check-square" : "square"}
                size={iconSize.md}
                color={entry.isCurrent ? colors.primary : colors.muted}
              />
              <AppText size="sm">I currently work here</AppText>
            </Pressable>
          </CardContent>
        </Card>
      ))}

      <AppButton label="+ Add experience" variant="outline" onPress={() => onChange([...periods, emptyExperiencePeriod()])} />

      {total ? (
        <AppText size="sm" weight="medium">
          Total experience: {total}
        </AppText>
      ) : null}
    </View>
  );
};
