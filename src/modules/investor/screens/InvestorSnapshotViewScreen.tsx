import { ScrollView, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { useInvestorSnapshot } from "@/modules/investorSnapshot/hooks";
import { projectApi } from "@/modules/project/api";
import { OwnershipPieChart } from "@/modules/investorSnapshot/components/OwnershipPieChart";
import { AppScreen } from "@/components/ui/AppScreen";
import { ScreenHeader } from "@/components/layout/ScreenHeader";



type MetricCardProps = {
  label: string;
  value: string | number | null;
};

const MetricCard = ({
  label,
  value,
}: MetricCardProps) => (
  <View className="w-[47%] rounded-xl border border-border bg-card p-3">
    <AppText
      size="xs"
      tone="muted"
    >
      {label}
    </AppText>

    <AppText
      weight="bold"
      size="lg"
      className="mt-1"
    >
      {value ?? "-"}
    </AppText>
  </View>
);

export const InvestorSnapshotViewScreen = () => {
  const route = useRoute<any>();
  const [project, setProject] = useState<any>(null);
  const { projectId } = route.params;

  const { 
    snapshot,
     loadSnapshot,
  } = useInvestorSnapshot();
  useEffect(() => {
    const loadData = async () => {
      await loadSnapshot(projectId);
  
      const projectData =
        await projectApi.getProjectById(projectId);
  
      setProject(projectData);
    };
  
    void loadData();
  }, [projectId, loadSnapshot]);

  if (!snapshot || !project) {
    return (
      <AppScreen>
        <ScreenHeader title="Investor Snapshot" />
        <View className="flex-1 items-center justify-center">
          <AppText>
            Loading investor snapshot...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Investor Snapshot" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      >
      <Card>
        <CardContent className="p-4">

        {/* Header */}

        <AppText
          family="display"
          size="2xl"
          weight="bold"
        >
          {project.name}
        </AppText>

        <AppText
          tone="muted"
          className="mt-1"
        >
          {project.tagline}
        </AppText>

        <View className="mt-2">
          <Badge
            label="Investor Ready"
            variant="outline"
          />
        </View>

        <View className="mt-3 flex-row flex-wrap gap-3">
          <Badge
            label={project.stage.toUpperCase()}
            variant="outline"
          />

          <Badge
            label={project.projectType.toUpperCase()}
            variant="outline"
          />
        </View>

        {/* Growth */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >  
          Growth Metrics
        </AppText>

        <View className="mt-5 flex-row flex-wrap gap-3">

        <MetricCard
          label="Total Users"
          value={snapshot.totalUsers?.toLocaleString() ?? null}
        />

        <MetricCard
          label="Active Users"
          value={snapshot.activeUsers?.toLocaleString() ?? null}
        />

        <MetricCard
          label="Paying Customers"
          value={snapshot.payingCustomers?.toLocaleString() ?? null}
        />

        <MetricCard
          label="Enterprise Customers"
          value={snapshot.enterpriseCustomers?.toLocaleString() ?? null}
        />
        
        <MetricCard
          label="User Growth"
          value={`${snapshot.customerGrowthRate}%`}
        />

        <MetricCard
          label="Revenue Growth"
          value={`${snapshot.revenueGrowthRate}%`}
        />

      </View>

      {/* Financial */}

      <AppText
        weight="bold"
        size="lg"
        className="mt-6"
      >
        Financial Highlights
      </AppText>

      <View className="mt-3 flex-row flex-wrap gap-3">

        <MetricCard
          label="MRR"
          value={
            snapshot.mrr != null
              ? `₹${snapshot.mrr.toLocaleString()}`
              :"-"
          }
        />

        <MetricCard
          label="ARR"
          value={
            snapshot.arr != null
            ? `₹${snapshot.arr.toLocaleString()}`
            :"-"
        }
        />

        <MetricCard
          label="Cash Balance"
          value={
            snapshot.cashBalance != null
            ? `₹${snapshot.cashBalance.toLocaleString()}`
            :"-"
        }
        />

        <MetricCard
          label="Burn Rate"
          value={
            snapshot.burnRate != null
            ? `₹${snapshot.burnRate.toLocaleString()}`
            :"-"
        }
        />

        <MetricCard
          label="Runway"
          value={
            snapshot.runwayMonths != null
            ? `${snapshot.runwayMonths} Months`
            : "-"
          }
        />

        <MetricCard
          label="Gross Margin"
          value={`${snapshot.grossMargin}%`}
        />

        <MetricCard
          label="EBITDA"
          value={
            snapshot.ebitda != null
            ? `₹${snapshot.ebitda.toLocaleString()}`
            :"-"
        }
        />

        <MetricCard
          label="EBITDA %"
          value={`${snapshot.ebitdaPercent}%`}
        />

      </View>
 
       {/* Fundraising */}

      <AppText
        weight="bold"
        size="lg"
        className="mt-6"
      >
        Fundraising
      </AppText>

      <View className="mt-3 flex-row flex-wrap gap-3">

        <MetricCard
          label="Round"
          value={snapshot.currentRound?.toUpperCase()}
        />

        <MetricCard
          label="Raising"
          value={
            snapshot.amountRaising != null
            ? `₹${snapshot.amountRaising.toLocaleString()}`
            :"-"
        }
        />

        <MetricCard
          label="Equity"
          value={
            snapshot.equityOffered != null
            ? `${snapshot.equityOffered}%`
            : "-"
          }
        />

        <MetricCard
          label="Min Check"
          value={
            snapshot.minimumCheckSize != null
            ? `₹${snapshot.minimumCheckSize.toLocaleString()}`
            : "-"
          }
        />

        <MetricCard
           label="Max Check"
           value={
             snapshot.maximumCheckSize != null
               ? `₹${snapshot.maximumCheckSize.toLocaleString()}`
               : "-"
        }
        />

        </View>

        {/* Ownership */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >
         Ownership
        </AppText>

        <View className="mt-3 items-center">
          <OwnershipPieChart
            founderOwnership={snapshot.founderOwnership ?? 0}
            employeeEsop={snapshot.employeeEsop ?? 0}
            investorOwnership={snapshot.investorOwnership ?? 0}
            availablePool={snapshot.availablePool ?? 0}
          />
        </View>

        {/* Business */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >
          Business Summary
        </AppText>

        <View className="mt-3 gap-3">

          <AppText>
            Target Customers: {snapshot.targetCustomers}
          </AppText>

          <AppText>
            Business Model: {snapshot.businessModel}
          </AppText>

          <AppText>
            Revenue Streams: {snapshot.revenueStreams}
          </AppText>

          <AppText>
            Market Opportunity: {snapshot.marketOpportunity}
          </AppText>
        </View>
        
        {/* Vision */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >
          Vision
        </AppText>

        <AppText className="mt-3">
          {snapshot.startupVision}
        </AppText>

        {/* Problem */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >
          Problem
        </AppText>

        <AppText className="mt-3">
          {snapshot.problemStatement}
        </AppText>

        {/* Solution */}

        <AppText
          weight="bold"
          size="lg"
          className="mt-6"
        >
          Solution
        </AppText>

        <AppText className="mt-3">
          {snapshot.solutionSummary}
        </AppText>

        </CardContent>
      </Card>
      </ScrollView>
    </AppScreen>
  );
};