import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Switch, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { AppButton } from "@/components/ui/AppButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { meetingApi } from "@/modules/meeting/api";
import { getDeviceTimezone } from "@/modules/meeting/hooks";
import { useToastStore } from "@/store/toastStore";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type DayRow = { enabled: boolean; startTime: string; endTime: string };

const defaultRow: DayRow = { enabled: false, startTime: "09:00", endTime: "17:00" };

export const AvailabilityScreen = () => {
  const colors = useThemeTokens();
  const [rows, setRows] = useState<DayRow[]>(DAYS.map(() => ({ ...defaultRow })));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pickerFor, setPickerFor] = useState<{ day: number; field: "startTime" | "endTime" } | null>(null);

  useEffect(() => {
    meetingApi
      .getMyAvailability()
      .then((slots: { dayOfWeek: number; startTime: string; endTime: string }[]) => {
        setRows((current) =>
          current.map((row, day) => {
            const match = slots.find((s) => s.dayOfWeek === day);
            return match ? { enabled: true, startTime: match.startTime, endTime: match.endTime } : row;
          })
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleDay = (day: number, value: boolean) => {
    setRows((current) => current.map((row, i) => (i === day ? { ...row, enabled: value } : row)));
  };

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    const target = pickerFor;
    setPickerFor(null);
    if (event.type === "dismissed" || !value || !target) return;
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    setRows((current) => current.map((row, i) => (i === target.day ? { ...row, [target.field]: `${hh}:${mm}` } : row)));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await meetingApi.saveAvailability({
        timezone: getDeviceTimezone(),
        slots: rows
          .map((row, dayOfWeek) => ({ ...row, dayOfWeek }))
          .filter((row) => row.enabled)
          .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
      });
      useToastStore.getState().show({ type: "success", title: "Availability saved" });
    } catch {
      useToastStore.getState().show({ type: "error", title: "Couldn't save availability" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="w-full max-w-2xl self-center px-4 pt-4">
        <AppText family="display" size="xl" weight="bold">
          Set your availability
        </AppText>
        <AppText tone="muted" size="sm" className="mt-2 leading-5">
          Turn on the days you're open to meet, and organizers will be able to book you directly — no back-and-forth.
        </AppText>

        {isLoading ? null : (
          <View className="mt-5 gap-3">
            {DAYS.map((label, day) => {
              const row = rows[day] ?? defaultRow;
              return (
                <Card key={label} className="p-4">
                  <View className="flex-row items-center justify-between">
                    <AppText weight="medium">{label}</AppText>
                    <Switch value={row.enabled} onValueChange={(v) => toggleDay(day, v)} />
                  </View>
                  {row.enabled ? (
                    <View className="mt-3 flex-row items-center gap-2">
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPickerFor({ day, field: "startTime" })}
                        className="h-10 flex-1 items-center justify-center rounded-md border border-input bg-background"
                      >
                        <AppText size="sm">{row.startTime}</AppText>
                      </Pressable>
                      <AppText tone="muted" size="sm">
                        to
                      </AppText>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPickerFor({ day, field: "endTime" })}
                        className="h-10 flex-1 items-center justify-center rounded-md border border-input bg-background"
                      >
                        <AppText size="sm">{row.endTime}</AppText>
                      </Pressable>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        )}

        <AppButton label="Save availability" loading={isSaving} onPress={() => void save()} className="mt-5" />

        {pickerFor ? (
          <DateTimePicker mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} value={new Date()} onChange={onPickerChange} />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
};
