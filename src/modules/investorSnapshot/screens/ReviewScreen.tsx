import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";

import { useInvestorSnapshot } from "../hooks";

export const ReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { projectId } = route.params;

  const {
    snapshot,
    loadSnapshot,
    updateSnapshot,
    isSaving,
  } = useInvestorSnapshot();

  useEffect(() => {
    if (projectId) {
      loadSnapshot(projectId);
    }
  }, [projectId]);

  const handlePublish = async () => {
    const success = await updateSnapshot(projectId, {
      completionPercentage: 100,
      isCompleted: true,
      isInvestorReady: true,
    });

    if (!success) return;

    navigation.navigate("Tabs", {
  screen: "Projects"});
  };

  const ownershipTotal =
    (snapshot?.founderOwnership || 0) +
    (snapshot?.employeeEsop || 0) +
    (snapshot?.investorOwnership || 0) +
    (snapshot?.availablePool || 0);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}

      <Card>
        <CardContent className="p-4">

          <AppText
            family="display"
            weight="bold"
            size="xl"
          >
            Investor Snapshot Review
          </AppText>

          <AppText
            tone="muted"
            className="mt-2"
          >
            Review all information before publishing.
          </AppText>

          <View className="mt-4">
            <AppText
              weight="bold"
              size="lg"
            >
              {snapshot?.completionPercentage ?? 100}% Complete
            </AppText>

            <AppText
              tone="success"
              className="mt-1"
            >
              Investor Ready ✓
            </AppText>
          </View>

        </CardContent>
      </Card>

      {/* Business Summary */}

      <Card className="mt-4">
        <CardContent className="p-4">

          <View className="flex-row items-center justify-between">

            <AppText weight="bold">
              Business Summary
            </AppText>

            <AppButton
              size="sm"
              variant="outline"
              label="Edit"
              onPress={() =>
                navigation.navigate(
                  "BusinessSummary",
                  { projectId }
                )
              }
            />

          </View>

          <View className="mt-4 gap-2">

            <AppText>
              Target Customers:
              {" "}
              {snapshot?.targetCustomers || "-"}
            </AppText>

            <AppText>
              Business Model:
              {" "}
              {snapshot?.businessModel || "-"}
            </AppText>

            <AppText>
              Revenue Streams:
              {" "}
              {snapshot?.revenueStreams || "-"}
            </AppText>

            <AppText>
              Market Opportunity:
              {" "}
              {snapshot?.marketOpportunity || "-"}
            </AppText>

            <AppText>
              Problem:
              {" "}
              {snapshot?.problemStatement || "-"}
            </AppText>

            <AppText>
              Solution:
              {" "}
              {snapshot?.solutionSummary || "-"}
            </AppText>

          </View>

        </CardContent>
      </Card>

      {/* Traction */}

      <Card className="mt-4">
        <CardContent className="p-4">

          <View className="flex-row items-center justify-between">

            <AppText weight="bold">
              Traction Summary
            </AppText>

            <AppButton
              size="sm"
              variant="outline"
              label="Edit"
              onPress={() =>
                navigation.navigate(
                  "Traction",
                  { projectId }
                )
              }
            />

          </View>

          <View className="mt-4 gap-2">

            <AppText>
              Total Users:
              {" "}
              {snapshot?.totalUsers ?? 0}
            </AppText>

            <AppText>
              Active Users:
              {" "}
              {snapshot?.activeUsers ?? 0}
            </AppText>

            <AppText>
              Paying Customers:
              {" "}
              {snapshot?.payingCustomers ?? 0}
            </AppText>

            <AppText>
              Enterprise Customers:
              {" "}
              {snapshot?.enterpriseCustomers ?? 0}
            </AppText>

            <AppText>
              Customer Growth:
              {" "}
              {snapshot?.customerGrowthRate ?? 0}%
            </AppText>

            <AppText>
              Revenue Growth:
              {" "}
              {snapshot?.revenueGrowthRate ?? 0}%
            </AppText>

          </View>

        </CardContent>
      </Card>

      {/* Financial */}

      <Card className="mt-4">
        <CardContent className="p-4">

          <View className="flex-row items-center justify-between">

            <AppText weight="bold">
              Financial Snapshot
            </AppText>

            <AppButton
              size="sm"
              variant="outline"
              label="Edit"
              onPress={() =>
                navigation.navigate(
                  "Financial",
                  { projectId }
                )
              }
            />

          </View>

          <View className="mt-4 gap-2">

            <AppText>
              MRR: ₹{snapshot?.mrr ?? 0}
            </AppText>

            <AppText>
              ARR: ₹{snapshot?.arr ?? 0}
            </AppText>

            <AppText>
              Cash Balance: ₹{snapshot?.cashBalance ?? 0}
            </AppText>

            <AppText>
              Burn Rate: ₹{snapshot?.burnRate ?? 0}
            </AppText>

            <AppText>
              Runway:
              {" "}
              {snapshot?.runwayMonths ?? 0}
              {" "}
              months
            </AppText>

            <AppText>
              Gross Margin:
              {" "}
              {snapshot?.grossMargin ?? 0}%
            </AppText>

            <AppText>
              CAC: ₹{snapshot?.cac ?? 0}
            </AppText>

            <AppText>
              LTV: ₹{snapshot?.ltv ?? 0}
            </AppText>

            <AppText>
              LTV:CAC:
              {" "}
              {snapshot?.ltvCacRatio ?? 0}
            </AppText>

            <AppText>
              Churn:
              {" "}
              {snapshot?.churnRate ?? 0}%
            </AppText>

            <AppText>
              EBITDA: ₹{snapshot?.ebitda ?? 0}
            </AppText>

            <AppText>
              EBITDA %:
              {" "}
              {snapshot?.ebitdaPercent ?? 0}%
            </AppText>

          </View>

        </CardContent>
      </Card>

      {/* Ownership */}

      <Card className="mt-4">
        <CardContent className="p-4">

          <View className="flex-row items-center justify-between">

            <AppText weight="bold">
              Ownership & Fundraising
            </AppText>

            <AppButton
              size="sm"
              variant="outline"
              label="Edit"
              onPress={() =>
                navigation.navigate(
                  "Ownership",
                  { projectId }
                )
              }
            />

          </View>

          <View className="mt-4 gap-2">

            <AppText>
              Current Round:
              {" "}
              {snapshot?.currentRound || "-"}
            </AppText>

            <AppText>
              Amount Raising:
              {" "}
              ₹{snapshot?.amountRaising ?? 0}
            </AppText>

            <AppText>
              Min Check:
              {" "}
              ₹{snapshot?.minimumCheckSize ?? 0}
            </AppText>

            <AppText>
              Max Check:
              {" "}
              ₹{snapshot?.maximumCheckSize ?? 0}
            </AppText>

            <AppText>
              Equity Offered:
              {" "}
              {snapshot?.equityOffered ?? 0}%
            </AppText>

            <AppText>
              Founder Ownership:
              {" "}
              {snapshot?.founderOwnership ?? 0}%
            </AppText>

            <AppText>
              Employee ESOP:
              {" "}
              {snapshot?.employeeEsop ?? 0}%
            </AppText>

            <AppText>
              Investor Ownership:
              {" "}
              {snapshot?.investorOwnership ?? 0}%
            </AppText>

            <AppText>
              Available Pool:
              {" "}
              {snapshot?.availablePool ?? 0}%
            </AppText>

            <AppText
              weight="bold"
              className="mt-2"
            >
              Ownership Total:
              {" "}
              {ownershipTotal}%
            </AppText>

          </View>

        </CardContent>
      </Card>

      {/* Publish */}

      <View className="mt-6">

        <AppButton
          label="Publish Investor Snapshot"
          loading={isSaving}
          onPress={() => void handlePublish()}
        />

      </View>

    </ScrollView>
  );
};