/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OpportunityAnalytics {
  totalOpportunities: number;
  accepted: number;
  rejected: number;
  proposed: number;
  draft: number;
  expired: number;
  acceptanceRate: number;
  rejectionRate: number;
  totalBudget: number;
  avgBudget: number;
}

export interface MonthlyOpportunityData {
  month: string;
  totalOpportunities: number;
  accepted: number;
  rejected: number;
  proposed: number;
  totalBudget: number;
  avgBudget: number;
  acceptanceRate: number;
}

export interface IncomeAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  averageROI: number;
  monthlyData: MonthlyIncomeData[];
  bestPerformingScenario?: {
    name: string;
    roi: number;
    income: number;
  };
}

export interface MonthlyIncomeData {
  month: string;
  income: number;
  expenses: number;
  netIncome: number;
  roi: number;
}

export interface ComparisonTableRow {
  id: string;
  name: string;
  data: Record<string, number | string>;
}

export interface ComparisonTableColumn {
  id: string;
  label: string;
  format?: (value: any) => string;
}

export interface SheetTableData {
  columns: ComparisonTableColumn[];
  rows: ComparisonTableRow[];
}

export type TimeFrame = "monthly" | "quarterly" | "yearly";
export type AnalysisType = "opportunities" | "income" | "custom";
