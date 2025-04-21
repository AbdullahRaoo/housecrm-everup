/* eslint-disable @typescript-eslint/no-unused-vars */
import { Opportunity } from "../types/opportunity";
import {
  IncomeAnalytics,
  MonthlyIncomeData,
  MonthlyOpportunityData,
  OpportunityAnalytics,
  SheetTableData,
  TimeFrame,
} from "../types/sheets";

// Helper function to format currency
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Analyze opportunities data to get summary statistics
 */
export const getOpportunityAnalytics = (
  opportunities: Opportunity[]
): OpportunityAnalytics => {
  if (
    !opportunities ||
    !Array.isArray(opportunities) ||
    opportunities.length === 0
  ) {
    return {
      totalOpportunities: 0,
      accepted: 0,
      rejected: 0,
      proposed: 0,
      draft: 0,
      expired: 0,
      acceptanceRate: 0,
      rejectionRate: 0,
      totalBudget: 0,
      avgBudget: 0,
    };
  }

  // Count opportunities by status
  const statusCounts = opportunities.reduce((acc, opp) => {
    const status = opp.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total and average budget
  const budgetInfo = opportunities.reduce(
    (acc, opp) => {
      acc.total += opp.budget.amount || 0;
      return acc;
    },
    { total: 0 }
  );

  const totalOpportunities = opportunities.length;
  const accepted = statusCounts.accepted || 0;
  const rejected = statusCounts.rejected || 0;
  const acceptanceRate =
    totalOpportunities > 0 ? (accepted / totalOpportunities) * 100 : 0;
  const rejectionRate =
    totalOpportunities > 0 ? (rejected / totalOpportunities) * 100 : 0;

  return {
    totalOpportunities,
    accepted,
    rejected,
    proposed: statusCounts.proposed || 0,
    draft: statusCounts.draft || 0,
    expired: statusCounts.expired || 0,
    acceptanceRate,
    rejectionRate,
    totalBudget: budgetInfo.total,
    avgBudget:
      totalOpportunities > 0 ? budgetInfo.total / totalOpportunities : 0,
  };
};

/**
 * Get opportunity data grouped by month
 */
export const getMonthlyOpportunityData = (
  opportunities: Opportunity[],
  timeFrame: TimeFrame = "monthly"
): MonthlyOpportunityData[] => {
  if (
    !opportunities ||
    !Array.isArray(opportunities) ||
    opportunities.length === 0
  ) {
    return [];
  }

  // Group opportunities by month
  const monthlyData = opportunities.reduce((acc, opp) => {
    if (!opp.createdAt) return acc;

    const date = new Date(opp.createdAt);
    let key: string;

    if (timeFrame === "monthly") {
      // Format: "Jan 2024"
      key = date.toLocaleString("en-US", { month: "short", year: "numeric" });
    } else if (timeFrame === "quarterly") {
      // Format: "Q1 2024"
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      key = `Q${quarter} ${date.getFullYear()}`;
    } else {
      // Yearly
      key = date.getFullYear().toString();
    }

    if (!acc[key]) {
      acc[key] = {
        month: key,
        totalOpportunities: 0,
        accepted: 0,
        rejected: 0,
        proposed: 0,
        totalBudget: 0,
        avgBudget: 0,
        acceptanceRate: 0,
      };
    }

    acc[key].totalOpportunities++;
    acc[key].totalBudget += opp.budget.amount || 0;

    if (opp.status === "Accepted") acc[key].accepted++;
    if (opp.status === "Rejected") acc[key].rejected++;
    if (opp.status === "Proposed") acc[key].proposed++;

    return acc;
  }, {} as Record<string, MonthlyOpportunityData>);

  // Calculate average and rates
  Object.keys(monthlyData).forEach((month) => {
    const data = monthlyData[month];
    data.avgBudget =
      data.totalOpportunities > 0
        ? data.totalBudget / data.totalOpportunities
        : 0;
    data.acceptanceRate =
      data.totalOpportunities > 0
        ? (data.accepted / data.totalOpportunities) * 100
        : 0;
  });

  // Convert to array and sort by date
  return Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Analyze income scenarios from opportunities
 */
export const getIncomeAnalytics = (
  opportunities: Opportunity[]
): IncomeAnalytics => {
  if (
    !opportunities ||
    !Array.isArray(opportunities) ||
    opportunities.length === 0
  ) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      averageROI: 0,
      monthlyData: [],
    };
  }

  // Flatten all income scenarios
  const allScenarios = opportunities.flatMap((opp) =>
    opp.incomeScenarios.map((scenario) => ({
      ...scenario,
      createdAt: opp.createdAt,
      opportunity: opp.title,
    }))
  );

  if (allScenarios.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      averageROI: 0,
      monthlyData: [],
    };
  }

  // Calculate totals
  const totalIncome = allScenarios.reduce((sum, s) => sum + (s.income || 0), 0);
  const totalExpenses = allScenarios.reduce(
    (sum, s) => sum + (s.expenses || 0),
    0
  );
  const netIncome = totalIncome - totalExpenses;

  // Calculate average ROI (filtering out scenarios without ROI)
  const scenariosWithROI = allScenarios.filter(
    (s) => s.roi !== undefined && s.roi !== null
  );
  const averageROI =
    scenariosWithROI.length > 0
      ? scenariosWithROI.reduce((sum, s) => sum + (s.roi || 0), 0) /
        scenariosWithROI.length
      : 0;

  // Find best performing scenario
  const bestScenario =
    scenariosWithROI.length > 0
      ? scenariosWithROI.reduce((best, current) => {
          return (current.roi || 0) > (best.roi || 0) ? current : best;
        }, scenariosWithROI[0])
      : undefined;

  // Group by month
  const monthlyData = allScenarios.reduce((acc, scenario) => {
    if (!scenario.createdAt) return acc;

    const date = new Date(scenario.createdAt);
    const month = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!acc[month]) {
      acc[month] = {
        month,
        income: 0,
        expenses: 0,
        netIncome: 0,
        roi: 0,
        scenarioCount: 0,
      };
    }

    acc[month].income += scenario.income || 0;
    acc[month].expenses += scenario.expenses || 0;
    acc[month].scenarioCount++;

    if (scenario.roi !== undefined && scenario.roi !== null) {
      acc[month].roi += scenario.roi;
    }

    return acc;
  }, {} as Record<string, MonthlyIncomeData & { scenarioCount: number }>);

  // Calculate monthly averages and net income
  Object.keys(monthlyData).forEach((month) => {
    const data = monthlyData[month];
    data.netIncome = data.income - data.expenses;
    data.roi = data.scenarioCount > 0 ? data.roi / data.scenarioCount : 0;
  });

  // Sort by date and remove temporary property
  const sortedMonthlyData = Object.values(monthlyData)
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    })
    .map(({ scenarioCount, ...rest }) => rest);

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    averageROI,
    monthlyData: sortedMonthlyData,
    bestPerformingScenario: bestScenario
      ? {
          name: bestScenario.name,
          roi: bestScenario.roi || 0,
          income: bestScenario.income || 0,
        }
      : undefined,
  };
};

/**
 * Create a comparison table for opportunities created vs. accepted/rejected
 */
export const getOpportunityComparisonTable = (
  monthlyData: MonthlyOpportunityData[]
): SheetTableData => {
  const columns = [
    { id: "name", label: "Month" },
    {
      id: "created",
      label: "Created",
      format: (value: number) => value.toString(),
    },
    {
      id: "accepted",
      label: "Accepted",
      format: (value: number) => value.toString(),
    },
    {
      id: "rejected",
      label: "Rejected",
      format: (value: number) => value.toString(),
    },
    {
      id: "proposed",
      label: "Proposed",
      format: (value: number) => value.toString(),
    },
    { id: "acceptRate", label: "Acceptance Rate", format: formatPercentage },
    {
      id: "avgBudget",
      label: "Avg Budget",
      format: (value: number) => formatCurrency(value),
    },
  ];

  const rows = monthlyData.map((data, index) => ({
    id: `row-${index}`,
    name: data.month,
    data: {
      created: data.totalOpportunities,
      accepted: data.accepted,
      rejected: data.rejected,
      proposed: data.proposed,
      acceptRate: data.acceptanceRate,
      avgBudget: data.avgBudget,
    },
  }));

  return { columns, rows };
};

/**
 * Create a comparison table for monthly income data
 */
export const getIncomeComparisonTable = (
  monthlyData: MonthlyIncomeData[]
): SheetTableData => {
  const columns = [
    { id: "name", label: "Month" },
    {
      id: "income",
      label: "Income",
      format: (value: number) => formatCurrency(value),
    },
    {
      id: "expenses",
      label: "Expenses",
      format: (value: number) => formatCurrency(value),
    },
    {
      id: "netIncome",
      label: "Net Income",
      format: (value: number) => formatCurrency(value),
    },
    { id: "roi", label: "ROI", format: formatPercentage },
  ];

  const rows = monthlyData.map((data, index) => ({
    id: `row-${index}`,
    name: data.month,
    data: {
      income: data.income,
      expenses: data.expenses,
      netIncome: data.netIncome,
      roi: data.roi,
    },
  }));

  return { columns, rows };
};
