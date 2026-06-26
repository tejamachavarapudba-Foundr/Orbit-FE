export type InvestorSnapshot = {
  id: string;
  projectId: string;

  // Business Summary
  targetCustomers: string;
  businessModel: string;
  revenueStreams: string;
  marketOpportunity: string;

  startupVision: string;
  problemStatement: string;
  solutionSummary: string;

  // Traction
  totalUsers: number | null;
  activeUsers: number | null;
  payingCustomers: number | null;
  enterpriseCustomers: number | null;

  customerGrowthRate: number | null;
  revenueGrowthRate: number | null;

  keyPartnerships: string;
  majorAchievements: string;

  // Financial
  mrr: number | null;
  arr: number | null;

  cashBalance: number | null;
  burnRate: number | null;
  runwayMonths: number | null;

  grossMargin: number | null;

  cac: number | null;
  ltv: number | null;
  ltvCacRatio: number | null;

  churnRate: number | null;

  ebitda: number | null;
  ebitdaPercent: number | null;

  // Fundraising
  amountRaising: number | null;
  equityOffered: number | null;

  currentRound: string;
  minimumCheckSize: number | null;
  maximumCheckSize: number | null;

  // Ownership
  founderOwnership: number | null;
  employeeEsop: number | null;
  investorOwnership: number | null;
  availablePool: number | null;

  // Documents
  pitchDeckUrl: string;
  financialProjectionUrl: string;
  dataRoomUrl: string;

  registrationDocUrl: string;
  gstDocUrl: string;
  govtIdDocUrl: string;

  // Progress
  completionPercentage: number;
  isCompleted: boolean;
  isInvestorReady: boolean;
};