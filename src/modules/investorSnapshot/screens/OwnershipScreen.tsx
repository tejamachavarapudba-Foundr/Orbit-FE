import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";

import { useInvestorSnapshot } from "../hooks";

export const OwnershipScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { projectId } = route.params;

  const {
    snapshot,
    loadSnapshot,
    updateSnapshot,
    isSaving,
  } = useInvestorSnapshot();

  // Fundraising
  const [currentRound, setCurrentRound] = useState("");
  const [amountRaising, setAmountRaising] = useState("");
  const [minimumCheckSize, setMinimumCheckSize] = useState("");
  const [maximumCheckSize, setMaximumCheckSize] = useState("");
  const [equityOffered, setEquityOffered] = useState("");

  // Ownership
  const [founderOwnership, setFounderOwnership] = useState("");
  const [employeeEsop, setEmployeeEsop] = useState("");
  const [investorOwnership, setInvestorOwnership] = useState("");
  const [availablePool, setAvailablePool] = useState("");

  useEffect(() => {
    if (projectId) {
      loadSnapshot(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!snapshot) return;

    setCurrentRound(snapshot.currentRound || "");

    setAmountRaising(
      snapshot.amountRaising?.toString() || ""
    );

    setMinimumCheckSize(
      snapshot.minimumCheckSize?.toString() || ""
    );

    setMaximumCheckSize(
      snapshot.maximumCheckSize?.toString() || ""
    );

    setEquityOffered(
      snapshot.equityOffered?.toString() || ""
    );

    setFounderOwnership(
      snapshot.founderOwnership?.toString() || ""
    );

    setEmployeeEsop(
      snapshot.employeeEsop?.toString() || ""
    );

    setInvestorOwnership(
      snapshot.investorOwnership?.toString() || ""
    );

    setAvailablePool(
      snapshot.availablePool?.toString() || ""
    );
  }, [snapshot]);

  const ownershipTotal = useMemo(() => {
    return (
      (Number(founderOwnership) || 0) +
      (Number(employeeEsop) || 0) +
      (Number(investorOwnership) || 0) +
      (Number(availablePool) || 0)
    );
  }, [
    founderOwnership,
    employeeEsop,
    investorOwnership,
    availablePool,
  ]);

  const saveDraft = async () => {
    await updateSnapshot(projectId, {
      currentRound,

      amountRaising:
        Number(amountRaising) || 0,

      minimumCheckSize:
        Number(minimumCheckSize) || 0,

      maximumCheckSize:
        Number(maximumCheckSize) || 0,

      equityOffered:
        Number(equityOffered) || 0,

      founderOwnership:
        Number(founderOwnership) || 0,

      employeeEsop:
        Number(employeeEsop) || 0,

      investorOwnership:
        Number(investorOwnership) || 0,

      availablePool:
        Number(availablePool) || 0,
    });
  };

  const handleContinue = async () => {
    if (ownershipTotal !== 100) {
      return;
    }

    const success = await updateSnapshot(projectId, {
      currentRound,

      amountRaising:
        Number(amountRaising) || 0,

      minimumCheckSize:
        Number(minimumCheckSize) || 0,

      maximumCheckSize:
        Number(maximumCheckSize) || 0,

      equityOffered:
        Number(equityOffered) || 0,

      founderOwnership:
        Number(founderOwnership) || 0,

      employeeEsop:
        Number(employeeEsop) || 0,

      investorOwnership:
        Number(investorOwnership) || 0,

      availablePool:
        Number(availablePool) || 0,

      completionPercentage: 100,
      isCompleted: true,
    });

    if (!success) return;

    navigation.navigate("Review", {
      projectId,
    });
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
    >
      <Card>
        <CardContent className="p-4">

          <AppText
            family="display"
            weight="bold"
            size="xl"
          >
            Investor Snapshot
          </AppText>

          <AppText
            tone="muted"
            size="sm"
            className="mt-1"
          >
            Step 4 of 4
          </AppText>

          <View className="mt-4">
            <AppText weight="semibold">
              {snapshot?.completionPercentage ?? 75}% Complete
            </AppText>
          </View>

          {/* FUNDRAISING */}

          <AppText
            weight="bold"
            className="mt-6"
          >
            Fundraising Details
          </AppText>

          <View className="mt-4 gap-4">

            <AppTextInput
              label="Current Round"
              value={currentRound}
              onChangeText={setCurrentRound}
              placeholder="Pre-Seed / Seed / Series A"
            />

            <AppTextInput
              label="Amount Raising (₹)"
              value={amountRaising}
              onChangeText={setAmountRaising}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Minimum Check Size (₹)"
              value={minimumCheckSize}
              onChangeText={setMinimumCheckSize}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Maximum Check Size (₹)"
              value={maximumCheckSize}
              onChangeText={setMaximumCheckSize}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Equity Offered (%)"
              value={equityOffered}
              onChangeText={setEquityOffered}
              keyboardType="numeric"
            />

          </View>

          {/* OWNERSHIP */}

          <AppText
            weight="bold"
            className="mt-8"
          >
            Ownership Structure
          </AppText>

          <View className="mt-4 gap-4">

            <AppTextInput
              label="Founder Ownership (%)"
              value={founderOwnership}
              onChangeText={setFounderOwnership}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Employee ESOP (%)"
              value={employeeEsop}
              onChangeText={setEmployeeEsop}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Investor Ownership (%)"
              value={investorOwnership}
              onChangeText={setInvestorOwnership}
              keyboardType="numeric"
            />

            <AppTextInput
              label="Available Pool (%)"
              value={availablePool}
              onChangeText={setAvailablePool}
              keyboardType="numeric"
            />

          </View>

          {/* VALIDATION */}

          <View className="mt-6 rounded-xl border border-border p-4">

            <AppText weight="bold">
              Ownership Total
            </AppText>

            <AppText
              size="xl"
              className="mt-2"
            >
              {ownershipTotal}%
            </AppText>

            <AppText
              tone={
                ownershipTotal === 100
                  ? "success"
                  : "danger"
              }
              className="mt-2"
            >
              {ownershipTotal === 100
                ? "✓ Ownership structure is valid"
                : "Ownership must equal 100%"}
            </AppText>

          </View>

          <View className="mt-6 flex-row gap-3">

            <AppButton
              label="Save Draft"
              variant="outline"
              className="flex-1"
              onPress={async () => {
                const success = await updateSnapshot(
                  projectId,
                  {
                    currentRound,
              
                    amountRaising:
                      Number(amountRaising) || 0,
              
                    minimumCheckSize:
                      Number(minimumCheckSize) || 0,
              
                    maximumCheckSize:
                      Number(maximumCheckSize) || 0,
              
                    equityOffered:
                      Number(equityOffered) || 0,
              
                    founderOwnership:
                      Number(founderOwnership) || 0,
              
                    employeeEsop:
                      Number(employeeEsop) || 0,
              
                    investorOwnership:
                      Number(investorOwnership) || 0,
              
                    availablePool:
                      Number(availablePool) || 0,
                  }
                );
              
                if (success) {
                  navigation.navigate("Tabs", {
                  screen: "Projects"});
                }
              }}
            />

            <AppButton
              label="Complete Snapshot"
              className="flex-1"
              loading={isSaving}
              disabled={ownershipTotal !== 100}
              onPress={() => void handleContinue()}
            />

          </View>

        </CardContent>
      </Card>
    </ScrollView>
  );
};