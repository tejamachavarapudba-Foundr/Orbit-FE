import { useState } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import {
  Certification,
  emptyCertification,
  emptyWorkExperience,
  findOverlappingPeriodIndices,
  getWorkExperienceValidationError,
  MONTH_OPTIONS,
  WorkExperience,
  workExperiencesToPeriods,
  YEAR_OPTIONS
} from "@/modules/profile/schemas/experience";

const isCompleteMonthYear = (value: string) => /^\d{4}-\d{2}$/.test(value);
import { verificationApi } from "@/modules/verification/api";
import { useToastStore } from "@/store/toastStore";

export const MonthYearPicker = ({
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
      <AppText size="sm" weight="medium">
        {label}
      </AppText>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Dropdown
            value={month ?? ""}
            options={MONTH_OPTIONS}
            placeholder="Month"
            onChange={(m) => onChange(`${year ?? ""}-${m}`)}
          />
        </View>
        <View className="flex-1">
          <Dropdown
            value={year ?? ""}
            options={YEAR_OPTIONS}
            placeholder="Year"
            onChange={(y) => onChange(`${y}-${month ?? ""}`)}
          />
        </View>
      </View>
    </View>
  );
};

export const ExperienceEditor = ({
  experiences,
  onChange
}: {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}) => {
  const colors = useThemeTokens();

  const updateEntry = (index: number, patch: Partial<WorkExperience>) => {
    onChange(experiences.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  // Only one experience can be "current" at a time — checking it here
  // unchecks it everywhere else, and moves this entry to the front, which
  // is what the "Current / most recent" label on index 0 already assumes.
  const toggleCurrent = (index: number) => {
    const target = experiences[index];
    if (!target) return;

    if (target.isCurrent) {
      updateEntry(index, { isCurrent: false });
      return;
    }

    const current: WorkExperience = { ...target, isCurrent: true, endDate: "" };
    const rest = experiences.filter((_, i) => i !== index).map((entry) => ({ ...entry, isCurrent: false }));
    onChange([current, ...rest]);
  };

  const overlappingIndices = findOverlappingPeriodIndices(workExperiencesToPeriods(experiences));

  return (
    <View className="gap-3">
      <AppText size="sm" weight="medium">
        Work experience
      </AppText>

      {experiences.map((entry, index) => {
        // Don't flag a freshly-added blank card before the user has typed
        // anything — errors only show once there's something to be wrong.
        const touched = Boolean(entry.company.trim() || entry.designation.trim() || entry.startDate.trim());
        const validationError = touched ? getWorkExperienceValidationError(entry) : null;
        const hasOverlap = touched && !validationError && overlappingIndices.has(index);
        // Once an end date is fully set, this is unambiguously a past role —
        // hiding the checkbox avoids the contradictory "current" + end-date
        // state. Clearing the end date brings the checkbox back.
        const endDateSet = isCompleteMonthYear(entry.endDate);

        return (
          <Card key={index}>
            <CardContent className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <AppText size="sm" tone="muted">
                  {entry.isCurrent ? "Current" : index === 0 ? "Most recent" : `Experience ${index + 1}`}
                </AppText>
                <Pressable accessibilityRole="button" onPress={() => removeEntry(index)} hitSlop={8}>
                  <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
                </Pressable>
              </View>
              <AppTextInput
                label="Company name"
                value={entry.company}
                onChangeText={(v) => updateEntry(index, { company: v })}
              />
              <AppTextInput
                label="Designation"
                value={entry.designation}
                onChangeText={(v) => updateEntry(index, { designation: v })}
                placeholder="e.g. Senior Software Engineer"
              />
              <AppTextInput
                label="Location"
                value={entry.location}
                onChangeText={(v) => updateEntry(index, { location: v })}
              />
              {!endDateSet ? (
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
              ) : null}
              <MonthYearPicker
                label="Start date"
                value={entry.startDate}
                onChange={(v) => updateEntry(index, { startDate: v })}
              />
              {!entry.isCurrent ? (
                <View className="gap-2">
                  <MonthYearPicker
                    label="End date"
                    value={entry.endDate}
                    onChange={(v) => updateEntry(index, { endDate: v })}
                  />
                  {endDateSet ? (
                    <Pressable accessibilityRole="button" onPress={() => updateEntry(index, { endDate: "" })}>
                      <AppText size="sm" tone="primary">
                        Clear end date
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {validationError ? (
                <AppText size="sm" tone="danger">
                  {validationError}
                </AppText>
              ) : hasOverlap ? (
                <AppText size="sm" tone="danger">
                  These dates overlap with another experience entry
                </AppText>
              ) : null}
            </CardContent>
          </Card>
        );
      })}

      <AppButton
        label="+ Add experience"
        variant="outline"
        onPress={() => onChange([...experiences, emptyWorkExperience()])}
      />
    </View>
  );
};

export const CertificationEditor = ({
  certifications,
  onChange
}: {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}) => {
  const colors = useThemeTokens();
  const showToast = useToastStore((state) => state.show);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateEntry = (index: number, patch: Partial<Certification>) => {
    onChange(certifications.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const uploadFile = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("type", "document");
      formData.append(
        "file",
        {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream"
        } as any
      );

      const upload = await verificationApi.uploadDocument(formData);
      updateEntry(index, { fileUrl: upload.url, fileKey: upload.path });
    } catch {
      showToast({ type: "error", title: "Upload failed" });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <View className="gap-3">
      <AppText size="sm" weight="medium">
        Certifications (optional)
      </AppText>

      {certifications.map((entry, index) => (
        <Card key={index}>
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <AppText size="sm" tone="muted">
                Certification {index + 1}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => removeEntry(index)} hitSlop={8}>
                <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
              </Pressable>
            </View>
            <AppTextInput
              label="Certification name"
              value={entry.name}
              onChangeText={(v) => updateEntry(index, { name: v })}
              placeholder="e.g. AWS Certified Solutions Architect"
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => void uploadFile(index)}
              className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3"
            >
              <AppText size="sm" tone={entry.fileUrl ? "default" : "muted"} numberOfLines={1} className="flex-1 pr-2">
                {uploadingIndex === index
                  ? "Uploading..."
                  : entry.fileUrl
                    ? "File attached — tap to replace"
                    : "Upload certificate file (PDF or image)"}
              </AppText>
              <Feather name="upload" size={iconSize.md} color={colors.muted} />
            </Pressable>
          </CardContent>
        </Card>
      ))}

      <AppButton
        label="+ Add certification"
        variant="outline"
        onPress={() => onChange([...certifications, emptyCertification()])}
      />
    </View>
  );
};
