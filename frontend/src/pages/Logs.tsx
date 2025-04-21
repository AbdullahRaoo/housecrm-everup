/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import logService from '../services/logService';
import { LogAction, LogEntityType, LogEntry, LogFilterOptions, LogStats } from '../types/log';

function Logs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState<LogFilterOptions>({
    page: 1,
    limit: 50,
    action: undefined,
    entityType: undefined,
    searchTerm: '',
    startDate: '',
    endDate: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      setError('You do not have permission to access this page.');
      setLoading(false);
    }
  }, [user]);

  // Load logs and stats
  useEffect(() => {
    if (!user?.isAdmin) return;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const [logsData, statsData] = await Promise.all([
          logService.getLogs(filters),
          logService.getLogStats()
        ]);

        setLogs(logsData.logs);
        setPagination(logsData.pagination);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs. Please try again.');
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filters, user?.isAdmin]);

  // Handle filter changes
  const handleFilterChange = (key: keyof LogFilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 whenever filters change
      ...(key !== 'page' && { page: 1 })
    }));
  };

  // Handle clear old logs
  const handleClearOldLogs = async (days: number) => {
    if (window.confirm(`Are you sure you want to clear logs older than ${days} days?`)) {
      try {
        setLoading(true);
        await logService.clearOldLogs(days);
        // Refresh logs and stats
        const [logsData, statsData] = await Promise.all([
          logService.getLogs(filters),
          logService.getLogStats()
        ]);

        setLogs(logsData.logs);
        setPagination(logsData.pagination);
        setStats(statsData);
        setLoading(false);
        alert(`Successfully cleared logs older than ${days} days.`);
      } catch (err) {
        console.error('Error clearing old logs:', err);
        setError('Failed to clear old logs. Please try again.');
        setLoading(false);
      }
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel') => {
    if (!user?.isAdmin) {
      alert('You need admin access to export log data.');
      return;
    }

    try {
      setIsExporting(true);

      // Get the blob using our API service
      const blob = await logService.exportLogs(filters, format);

      // Create a download link for the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      alert(`Failed to export logs as ${format}. Please try again.`);
      setIsExporting(false);
    }
  };

  // Format date/time
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
    } catch (err) {
      return dateString;
    }
  };

  // Get badge color based on action
  const getActionBadgeColor = (action: LogAction) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'EXPORT': return 'bg-yellow-100 text-yellow-800';
      case 'IMPORT': return 'bg-indigo-100 text-indigo-800';
      case 'VIEW': return 'bg-gray-100 text-gray-600';
      case 'STATUS_CHANGE': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get badge color based on entity type
  const getEntityTypeBadgeColor = (entityType: LogEntityType) => {
    switch (entityType) {
      case 'USER': return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER': return 'bg-green-100 text-green-800';
      case 'PROPERTY': return 'bg-purple-100 text-purple-800';
      case 'OPPORTUNITY': return 'bg-yellow-100 text-yellow-800';
      case 'EVENT': return 'bg-indigo-100 text-indigo-800';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (loading && !logs.length) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-3xl font-medium text-gray-700">System Logs</h3>
          <p className="mt-1 text-sm text-gray-500">Track all activities in the CRM system</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2 flex flex-wrap gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className={`${isExporting ? 'bg-green-400' : 'bg-green-600'} text-white px-4 py-2 rounded-lg
              hover:bg-green-700 transition-colors duration-200
              font-medium shadow-sm flex items-center gap-1`}
          >
            {isExporting ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </>
            )}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className={`${isExporting ? 'bg-blue-400' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg
              hover:bg-blue-700 transition-colors duration-200
              font-medium shadow-sm flex items-center gap-1`}
          >
            {isExporting ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </>
            )}
          </button>
          <button
            onClick={() => handleClearOldLogs(90)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Old Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Total Logs</h4>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">Today</h4>
            <p className="text-2xl font-bold text-gray-800">{stats.today}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">This Week</h4>
            <p className="text-2xl font-bold text-gray-800">{stats.thisWeek}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-500">This Month</h4>
            <p className="text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="EXPORT">Export</option>
              <option value="IMPORT">Import</option>
              <option value="STATUS_CHANGE">Status Change</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
              value={filters.entityType || ''}
              onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
            >
              <option value="">All Entity Types</option>
              <option value="USER">User</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROPERTY">Property</option>
              <option value="OPPORTUNITY">Opportunity</option>
              <option value="EVENT">Event</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search in descriptions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 50 })}
              className="px-4 py-2 border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userId ? (
                        <div>
                          <div>{log.userId.name}</div>
                          <div className="text-xs text-gray-500">{log.userId.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEntityTypeBadgeColor(log.entityType)}`}>
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                    disabled={pagination.page <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Previous
                  </button>

                  {/* Page number buttons */}
                  {[...Array(pagination.pages)].map((_, i) => {
                    // Only show a few pages around the current page
                    if (
                      i + 1 === 1 ||
                      i + 1 === pagination.pages ||
                      (i + 1 >= pagination.page - 1 && i + 1 <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => handleFilterChange('page', i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === i + 1
                            ? 'text-[#e56e43] border-[#e56e43] z-10'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (
                      (i + 1 === pagination.page - 2 && pagination.page > 3) ||
                      (i + 1 === pagination.page + 2 && pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span
                          key={i}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page >= pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page >= pagination.pages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;
