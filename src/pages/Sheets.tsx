import { useEffect, useState } from 'react';
import ComparisonTable from '../components/sheets/ComparisonTable';
import StatCard from '../components/sheets/StatCard';
import { useOpportunity } from '../context/OpportunityContext';
import { useAuth } from '../hooks/useAuth';
import { getIncomeAnalytics, getIncomeComparisonTable, getMonthlyOpportunityData, getOpportunityAnalytics, getOpportunityComparisonTable } from '../services/sheetsService';
import { IncomeAnalytics, OpportunityAnalytics, SheetTableData, TimeFrame } from '../types/sheets';

function Sheets() {
  const { token } = useAuth();
  const { state: { opportunities, loading, error }, fetchOpportunities } = useOpportunity();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
  const [opportunityStats, setOpportunityStats] = useState<OpportunityAnalytics | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeAnalytics | null>(null);
  const [opportunityTableData, setOpportunityTableData] = useState<SheetTableData>({ columns: [], rows: [] });
  const [incomeTableData, setIncomeTableData] = useState<SheetTableData>({ columns: [], rows: [] });

  // Fetch opportunities data
  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token, fetchOpportunities]);

  // Process data when opportunities change
  useEffect(() => {
    if (opportunities && opportunities.length > 0) {
      // Get opportunity analytics
      const oppStats = getOpportunityAnalytics(opportunities);
      setOpportunityStats(oppStats);

      // Get income analytics
      const incStats = getIncomeAnalytics(opportunities);
      setIncomeStats(incStats);

      // Get monthly data
      const monthlyOppData = getMonthlyOpportunityData(opportunities, timeFrame);
      setOpportunityTableData(getOpportunityComparisonTable(monthlyOppData));

      if (incStats.monthlyData.length > 0) {
        setIncomeTableData(getIncomeComparisonTable(incStats.monthlyData));
      }
    }
  }, [opportunities, timeFrame]);

  // Format currency helper
  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage helper
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e56e43]"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-gray-700 text-3xl font-medium">Sheets</h3>
          <p className="text-gray-500 mt-1">Compare and analyze opportunities and income data</p>
        </div>

        {/* Time frame selector */}
        <div>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Stats Overview Cards */}
      {opportunityStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Opportunities"
            value={opportunityStats.totalOpportunities}
            color="#3b82f6"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatCard
            title="Acceptance Rate"
            value={formatPercentage(opportunityStats.acceptanceRate)}
            color="#10b981"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Rejected Rate"
            value={formatPercentage(opportunityStats.rejectionRate)}
            color="#ef4444"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Average Budget"
            value={formatCurrency(opportunityStats.avgBudget)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#e56e43" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Income Stats */}
      {incomeStats && incomeStats.monthlyData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projected Income"
            value={formatCurrency(incomeStats.totalIncome)}
            subtitle="From all income scenarios"
            color="#10b981"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(incomeStats.totalExpenses)}
            color="#ef4444"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Net Income"
            value={formatCurrency(incomeStats.netIncome)}
            color="#3b82f6"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Average ROI"
            value={formatPercentage(incomeStats.averageROI)}
            subtitle={incomeStats.bestPerformingScenario ? `Best: ${incomeStats.bestPerformingScenario.name}` : ''}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="#e56e43" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Opportunity Comparison Table */}
        <ComparisonTable
          title="Opportunity Analysis"
          columns={opportunityTableData.columns}
          rows={opportunityTableData.rows}
        />

        {/* Income Comparison Table */}
        {incomeTableData.rows.length > 0 && (
          <ComparisonTable
            title="Income Analysis"
            columns={incomeTableData.columns}
            rows={incomeTableData.rows}
          />
        )}
      </div>

      {/* No data message */}
      {opportunities.length === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center">
          <p className="font-medium">No opportunities data available</p>
          <p className="text-sm mt-1">Create some opportunities to see analysis and comparison tables here.</p>
        </div>
      )}
    </div>
  );
}

export default Sheets;
