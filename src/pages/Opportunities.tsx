import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOpportunity } from '../context/OpportunityContext';
import { useAuth } from '../hooks/useAuth';
import { Opportunity } from '../types/opportunity';

interface FilterState {
  search: string;
  status: 'all' | 'Draft' | 'Proposed' | 'Accepted' | 'Rejected' | 'Expired';
  sortBy: keyof Opportunity | 'customerName';
  sortDirection: 'asc' | 'desc';
  page: number;
  itemsPerPage: number;
}

function Opportunities() {
  const { token } = useAuth();
  const { state: { opportunities, loading, error }, fetchOpportunities, deleteOpportunity } = useOpportunity();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'title',
    sortDirection: 'asc',
    page: 1,
    itemsPerPage: 10
  });

  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token, fetchOpportunities]);

  // Handle selecting all opportunities
  const handleSelectAll = (checked: boolean) => {
    setSelectedOpportunities(checked ? filteredOpportunities.map(o => o._id || o.id || '') : []);
  };

  // Handle selecting individual opportunity
  const handleSelectOpportunity = (opportunityId: string) => {
    setSelectedOpportunities(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle status filter change
  const handleStatusFilter = (status: FilterState['status']) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  // Handle sorting
  const handleSort = (field: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle deleting an opportunity
  const handleDeleteOpportunity = async (id: string) => {
    if (!token) {
      console.error("User is not authenticated.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this opportunity?");
    if (!confirmDelete) return;

    try {
      await deleteOpportunity(id);
      console.log("Opportunity deleted successfully.");
      fetchOpportunities(); // Refresh the list after deletion
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      alert("Failed to delete opportunity. Please try again.");
    }
  };

  // Filter opportunities based on search and status
  const filteredOpportunities = (opportunities || [])
    .filter(opportunity => {
      // Filter by search term
      const matchesSearch = opportunity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (opportunity.customer?.name && opportunity.customer.name.toLowerCase().includes(filters.search.toLowerCase()));

      // Filter by status
      const matchesStatus = filters.status === 'all' || opportunity.status === filters.status;

      return matchesSearch && matchesStatus;
    });

  // Sort filtered opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    let valueA, valueB;

    // Special handling for nested/custom sort properties
    if (filters.sortBy === 'customerName') {
      valueA = a.customer?.name || '';
      valueB = b.customer?.name || '';
    } else {
      valueA = a[filters.sortBy] || '';
      valueB = b[filters.sortBy] || '';

      // Additional handling for nested objects if needed
      if (filters.sortBy === 'budget') {
        valueA = a.budget?.amount || 0;
        valueB = b.budget?.amount || 0;
      }
    }

    // Perform the comparison
    if (typeof valueA === 'string') {
      return filters.sortDirection === 'asc'
        ? valueA.localeCompare(valueB as string)
        : (valueB as string).localeCompare(valueA);
    } else {
      return filters.sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    }
  });

  // Paginate the results
  const totalPages = Math.ceil(sortedOpportunities.length / filters.itemsPerPage);
  const paginatedOpportunities = sortedOpportunities.slice(
    (filters.page - 1) * filters.itemsPerPage,
    filters.page * filters.itemsPerPage
  );

  // Format currency for display
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-700 text-3xl font-medium">Opportunities</h3>
          <p className="text-gray-500 mt-1">{filteredOpportunities.length} opportunities found</p>
        </div>
        <div className="flex gap-2">
          {selectedOpportunities.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete Selected ({selectedOpportunities.length})
            </button>
          )}
          <Link
            to="/opportunities/new"
            className="bg-[#e56e43] hover:bg-[#e56e43] text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Opportunity
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <input
          type="text"
          placeholder="Search opportunities..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        />
        <select
          value={filters.status}
          onChange={(e) => handleStatusFilter(e.target.value as FilterState['status'])}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Proposed">Proposed</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
        <select
          value={filters.itemsPerPage}
          onChange={(e) => setFilters(prev => ({ ...prev, itemsPerPage: Number(e.target.value), page: 1 }))}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">
                <input
                  type="checkbox"
                  checked={selectedOpportunities.length === filteredOpportunities.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th
                onClick={() => handleSort('title')}
                className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</span>
                  {filters.sortBy === 'title' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('customerName')}
                className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</span>
                  {filters.sortBy === 'customerName' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('budget')}
                className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget</span>
                  {filters.sortBy === 'budget' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                  {filters.sortBy === 'status' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</span>
                  {filters.sortBy === 'createdAt' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOpportunities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-5 text-center text-gray-500">
                  No opportunities found
                </td>
              </tr>
            ) : (
              paginatedOpportunities.map((opportunity) => (
                <tr key={opportunity._id || opportunity.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.includes(opportunity._id || opportunity.id || '')}
                      onChange={() => handleSelectOpportunity(opportunity._id || opportunity.id || '')}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <Link to={`/opportunities/${opportunity._id || opportunity.id}`} className="text-blue-600 hover:text-blue-900">
                      {opportunity.title}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <Link to={`/customers/${opportunity.customerId}`} className="text-gray-900 whitespace-no-wrap">
                      {opportunity.customer?.name || 'Unknown customer'}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {formatCurrency(opportunity.budget.amount, opportunity.budget.currency)}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${opportunity.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                          opportunity.status === 'Proposed' ? 'bg-blue-100 text-blue-800' :
                            opportunity.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                              opportunity.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`
                      }
                    >
                      {opportunity.status}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(opportunity.createdAt || '').toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/opportunities/edit/${opportunity._id || opportunity.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteOpportunity(opportunity._id || opportunity.id || '')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-600">
            Showing {((filters.page - 1) * filters.itemsPerPage) + 1} to{' '}
            {Math.min(filters.page * filters.itemsPerPage, filteredOpportunities.length)} of{' '}
            {filteredOpportunities.length} entries
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
                className={`px-4 py-2 border rounded-lg ${filters.page === page ? 'bg-[#e56e43] text-white' : 'hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete {selectedOpportunities.length} selected opportunity(s)?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Implementation for bulk delete will go here
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Opportunities;
