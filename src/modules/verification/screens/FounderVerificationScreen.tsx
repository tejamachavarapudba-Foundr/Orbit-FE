import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { verificationApi } from "@/modules/verification/api";
import { useVerificationStatus } from "@/modules/verification/hooks";
import { FounderVerificationStatus } from "@/modules/verification/types";
import { useToastStore } from "@/store/toastStore";

const statusCopy: Record<
  FounderVerificationStatus,
  { label: string; tone: "muted" | "primary" | "danger"; icon: keyof typeof Feather.glyphMap }
> = {
  pending: { label: "Under review", tone: "primary", icon: "clock" },
  approved: { label: "Verified", tone: "primary", icon: "check-circle" },
  rejected: { label: "Rejected — you can resubmit below", tone: "danger", icon: "x-circle" }
};

export const FounderVerificationScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { status, loadStatus } = useVerificationStatus();
  const showToast = useToastStore((state) => state.show);

  const [certificateName, setCertificateName] = useState(status?.founder?.certificateName ?? "");
  const [cinNumber, setCinNumber] = useState(status?.founder?.cinNumber ?? "");
  const [file, setFile] = useState<{ uri: string; name: string; mimeType: string | undefined } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const founder = status?.founder;
  const canResubmit = !founder || founder.status === "rejected";

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
  };

  const submit = async () => {
    if (!certificateName.trim() || !file) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", "document");
      formData.append(
        "file",
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream"
        } as any
      );

      const upload = await verificationApi.uploadDocument(formData);
      await verificationApi.submitFounderVerification({
        certificateName: certificateName.trim(),
        cinNumber: cinNumber.trim() || undefined,
        documentUrl: upload.url,
        documentKey: upload.path
      });

      await loadStatus();
      showToast({ type: "success", title: "Certificate submitted", message: "We'll review it shortly." });
      navigation.goBack();
    } catch (error) {
      showToast({ type: "error", title: "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <View className="flex-row items-center gap-2 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          Founder verification
        </AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <AppText tone="muted" size="sm" className="mt-2">
          Upload your startup or Pvt Ltd company registration certificate. An admin checks the founder name on it against
          your account before approving.
        </AppText>

        {founder ? (
          <Card className="mt-4">
            <CardContent className="flex-row items-center gap-3 p-4">
              <Feather
                name={statusCopy[founder.status].icon}
                size={iconSize.lg}
                color={founder.status === "rejected" ? colors.danger : colors.primary}
              />
              <View className="min-w-0 flex-1">
                <AppText weight="semibold">{statusCopy[founder.status].label}</AppText>
                {founder.status === "rejected" && founder.reviewNotes ? (
                  <AppText tone="muted" size="sm" className="mt-1">
                    {founder.reviewNotes}
                  </AppText>
                ) : null}
              </View>
            </CardContent>
          </Card>
        ) : null}

        {canResubmit ? (
          <View className="mt-5 gap-3">
            <AppTextInput
              label="Founder name on certificate"
              value={certificateName}
              onChangeText={setCertificateName}
              placeholder="Name exactly as it appears on the certificate"
            />
            <AppTextInput
              label="CIN number (optional)"
              value={cinNumber}
              onChangeText={setCinNumber}
              autoCapitalize="characters"
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => void pickFile()}
              className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3"
            >
              <AppText size="sm" tone={file ? "default" : "muted"} numberOfLines={1} className="flex-1 pr-2">
                {file ? file.name : "Upload registration certificate (PDF or image)"}
              </AppText>
              <Feather name="upload" size={iconSize.md} color={colors.muted} />
            </Pressable>

            <AppButton
              label={founder ? "Resubmit" : "Submit for review"}
              loading={isSubmitting}
              disabled={!certificateName.trim() || !file}
              onPress={() => void submit()}
              className="mt-2"
            />
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
};
