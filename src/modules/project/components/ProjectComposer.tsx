import { useState } from "react";
import { Modal, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Video as VideoCompressor } from "react-native-compressor";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { BottomSheetPicker } from "@/components/ui/BottomSheetPicker";
import { Card, CardContent } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { FounderOfferBottomSheet } from "@/modules/project/components/FounderOfferBottomSheet";
import {
  FUNDING_STAGE_OPTIONS,
  projectStageOptions,
  projectTypeOptions,
  useProjectForm
} from "@/modules/project/hooks";
import { useProjectStore } from "@/modules/project/store";
import { Project } from "@/modules/project/types";
import { verificationApi } from "@/modules/verification/api";
import { isValidUrl } from "@/utils/validation";
import { useToastStore } from "@/store/toastStore";

const stageOptions = projectStageOptions.filter((option) => option.value !== "all");
const typeOptions = projectTypeOptions.filter((option) => option.value !== "all");

type ProjectComposerProps = {
  project?: Project | null;
  onDone?: () => void;
  autoExpanded?: boolean;
};

export const ProjectComposer = ({ project = null, onDone, autoExpanded = false }: ProjectComposerProps) => {
  const colors = useThemeTokens();
  const showToast = useToastStore((state) => state.show);
  const updatePitchVideo = useProjectStore((state) => state.updatePitchVideo);
  const [isExpanded, setIsExpanded] = useState(autoExpanded || Boolean(project));
  const [showPitchTip, setShowPitchTip] = useState(true);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isCompressingVideo, setIsCompressingVideo] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  // Held locally until the project actually exists — a brand-new project has
  // no id yet, so the video can't be PATCHed up until right after creation.
  const [pendingVideo, setPendingVideo] = useState<{ uri: string; name: string; type: string } | null>(null);
  const { values, setField, submit, isSubmitting, isEditing, canSubmit } = useProjectForm(project);

  const hasPitchVideo = Boolean(values.pitchVideoUrl.trim()) || Boolean(pendingVideo);
  const canSubmitForm = canSubmit && hasPitchVideo;

  const pickPitchVideo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast({
          type: "error",
          title: "Permission needed",
          message: "Allow video library access in your device settings to upload a pitch video."
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], quality: 0.8 });
      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset) return;

      // Compress once here, before either upload path — a smaller file
      // uploads faster and, more importantly, streams faster for every
      // future viewer of the pitch-reels feed.
      setIsCompressingVideo(true);
      let compressedUri = asset.uri;
      try {
        compressedUri = await VideoCompressor.compress(asset.uri, { compressionMethod: "auto" });
      } catch (error) {
        // Compression failing (unsupported codec, etc.) shouldn't block the
        // upload — fall back to the original file.
        compressedUri = asset.uri;
      } finally {
        setIsCompressingVideo(false);
      }

      const preparedVideo = {
        uri: compressedUri,
        name: asset.fileName ?? "pitch-video.mp4",
        type: asset.mimeType ?? "video/mp4"
      };

      if (project) {
        setIsUploadingVideo(true);
        try {
          const didSucceed = await updatePitchVideo(project.id, preparedVideo);

          if (didSucceed) {
            const updated = useProjectStore.getState().projects.find((item) => item.id === project.id);
            if (updated) setField("pitchVideoUrl", updated.pitchVideoUrl);
          }
        } finally {
          setIsUploadingVideo(false);
        }
      } else {
        // New project — nothing to attach to yet, upload happens right after creation succeeds.
        setPendingVideo(preparedVideo);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Couldn't open video library",
        message: error instanceof Error ? error.message : "Please try again."
      });
    }
  };

  const pickIncorporationDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    setIsUploadingCert(true);
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
      setField("incorporationDocUrl", upload.url);
      setField("incorporationDocKey", upload.path);
    } catch {
      showToast({ type: "error", title: "Upload failed" });
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleSubmit = async () => {
    const didSucceed = await submit();
    if (!didSucceed) return;

    if (!project && pendingVideo) {
      const created = useProjectStore.getState().projects[0];
      if (created) {
        setIsUploadingVideo(true);
        try {
          await updatePitchVideo(created.id, pendingVideo);
        } finally {
          setIsUploadingVideo(false);
        }
      }
      setPendingVideo(null);
    }

    setIsExpanded(Boolean(project) && autoExpanded);
    onDone?.();
  };

  if (!isExpanded) {
    return (
      <View className="mt-2 px-1">
        <AppButton label="+ New project" className="self-start px-6" onPress={() => setIsExpanded(true)} />
      </View>
    );
  }

  return (
    <>
      {showPitchTip && !isEditing ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowPitchTip(false)}>
          <View className="flex-1 items-center justify-center bg-black/40 px-6">
            <View className="w-full max-w-sm items-center gap-3 rounded-lg bg-surface p-5">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                <Feather name="video" size={20} color="#fff" />
              </View>
              <AppText family="display" weight="semibold" size="lg">
                Before you start
              </AppText>
              <AppText tone="muted" size="sm" className="text-center">
                Make sure your pitch video is within 30–45 seconds — that&apos;s the sweet spot for investors to
                quickly find your potential.
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPitchTip(false)}
                className="mt-1 w-full items-center rounded-md bg-primary py-3"
              >
                <AppText weight="semibold" style={{ color: "#fff" }}>
                  Got it
                </AppText>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      <Card className="mt-2">
      <CardContent className="gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <AppText family="display" weight="semibold" size="lg">
            {isEditing ? "Edit project" : "New project"}
          </AppText>
          <AppButton
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={() => {
              setIsExpanded(Boolean(project) && autoExpanded);
              onDone?.();
            }}
          />
        </View>

        <AppText tone="muted" size="sm">
          Share your startup with the Orbit community.
        </AppText>

        <AppTextInput
          label="Project name"
          required
          value={values.name}
          onChangeText={(value) => setField("name", value)}
        />
        <AppTextInput
          label="Tagline"
          required
          value={values.tagline}
          onChangeText={(value) => setField("tagline", value)}
        />

        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Description
            <AppText tone="danger"> *</AppText>
          </AppText>
          <TextInput
            value={values.description}
            onChangeText={(value) => setField("description", value)}
            placeholder="What are you building?"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="min-h-24 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <AppText size="sm" weight="medium">
              Platform
              <AppText tone="danger"> *</AppText>
            </AppText>
            <BottomSheetPicker
              value={values.projectType}
              options={typeOptions}
              onChange={(value) => {
                setField("projectType", value);
                // Category was folded into Platform — keep it in sync for anything
                // that still reads project.category.
                setField("category", value);
              }}
              placeholder="Platform"
              title="Platform"
            />
          </View>
          <View className="flex-1 gap-2">
            <AppText size="sm" weight="medium">
              Stage
              <AppText tone="danger"> *</AppText>
            </AppText>
            <BottomSheetPicker
              value={values.stage}
              options={stageOptions}
              onChange={(value) => setField("stage", value)}
              placeholder="Stage"
              title="Stage"
            />
          </View>
        </View>

        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Funding Stage
            <AppText tone="danger"> *</AppText>
          </AppText>
          <BottomSheetPicker
            value={values.fundingStage}
            options={FUNDING_STAGE_OPTIONS}
            onChange={(value) => setField("fundingStage", value)}
            placeholder="Select funding stage"
            title="Funding Stage"
          />
        </View>

        <AppTextInput
          label="Founded Year"
          required
          value={values.foundedYear?.toString() ?? ""}
          onChangeText={(value) => setField("foundedYear", value ? Number(value) : null)}
          keyboardType="numeric"
        />
        <AppTextInput
          label="Location"
          required
          value={values.location}
          onChangeText={(value) => setField("location", value)}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <AppTextInput
              label="CIN number"
              required
              value={values.cinNumber}
              onChangeText={(value) => setField("cinNumber", value)}
              autoCapitalize="characters"
              placeholder="U72900KA2020PTC..."
            />
          </View>
          <View className="flex-1">
            <AppTextInput
              label="DPIIT number"
              value={values.dpiitNumber}
              onChangeText={(value) => setField("dpiitNumber", value)}
              autoCapitalize="characters"
              placeholder="DIPP..."
            />
          </View>
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Certificate of Incorporation
            <AppText tone="danger"> *</AppText>
          </AppText>
          <AppText tone="muted" size="xs">
            Upload the certificate, or explain why you don&apos;t have one yet — one of the two is required to
            publish. This gets reviewed after publishing.
          </AppText>
          <AppButton
            label={
              isUploadingCert
                ? "Uploading…"
                : values.incorporationDocUrl.trim()
                  ? "Replace file"
                  : "Upload file"
            }
            variant={values.incorporationDocUrl.trim() ? "outline" : "primary"}
            size="sm"
            loading={isUploadingCert}
            onPress={() => void pickIncorporationDoc()}
            className="self-start"
          />
          {values.incorporationDocUrl.trim() ? (
            <AppText tone="success" size="xs">
              File attached ✓
            </AppText>
          ) : null}
          <TextInput
            value={values.incorporationReason}
            onChangeText={(value) => setField("incorporationReason", value)}
            placeholder="Or type a reason (e.g. incorporation in progress)"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            multiline
            textAlignVertical="top"
            className="min-h-16 rounded-md border border-input bg-background px-3 py-3 text-sm leading-5 text-text"
          />
        </View>

        <AppTextInput
          label="Website"
          required
          value={values.websiteUrl}
          onChangeText={(value) => setField("websiteUrl", value)}
          autoCapitalize="none"
          keyboardType="url"
          error={values.websiteUrl.trim() && !isValidUrl(values.websiteUrl) ? "Enter a valid website URL" : undefined}
        />
        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Founder Pitch Video
            <AppText tone="danger"> *</AppText>
          </AppText>
          <AppText tone="muted" size="xs">
            Upload a video file — links (YouTube, webpages, etc.) can&apos;t be played in-app, so only a direct upload is
            accepted.
          </AppText>
          <AppButton
            label={
              isCompressingVideo
                ? "Compressing…"
                : isUploadingVideo
                  ? "Uploading…"
                  : hasPitchVideo
                    ? "Replace video file"
                    : "Upload video file"
            }
            variant={hasPitchVideo ? "outline" : "primary"}
            size="sm"
            loading={isCompressingVideo || isUploadingVideo}
            onPress={() => void pickPitchVideo()}
            className="self-start"
          />
          {pendingVideo ? (
            <AppText tone="success" size="xs">
              Selected: {pendingVideo.name} — will upload once the project is created.
            </AppText>
          ) : values.pitchVideoUrl.trim() ? (
            <AppText tone="success" size="xs">
              Video uploaded ✓
            </AppText>
          ) : null}
        </View>

        <View className="gap-2">
          <AppText size="sm" weight="medium">
            Founder&apos;s Offer
            <AppText tone="danger"> *</AppText>
          </AppText>
          <FounderOfferBottomSheet
            askAmount={values.askAmount}
            equityPercent={values.equityPercent}
            onChange={({ askAmount, equityPercent }) => {
              setField("askAmount", askAmount);
              setField("equityPercent", equityPercent);
            }}
          />
        </View>
        <AppTextInput
          label="Tech stack"
          required
          value={values.techStackText}
          onChangeText={(value) => setField("techStackText", value)}
          placeholder="react, node"
        />
        <AppTextInput
          label="Looking for"
          required
          value={values.lookingForText}
          onChangeText={(value) => setField("lookingForText", value)}
          placeholder="engineer, designer"
        />

        <AppButton
          label={isEditing ? "Save changes" : "Create project"}
          loading={isSubmitting}
          disabled={!canSubmitForm}
          onPress={() => void handleSubmit()}
          className="mt-1"
        />
      </CardContent>
      </Card>
    </>
  );
};
