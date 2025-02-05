/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createStorageService, StorageKeys } from '../services/storage';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  lastInteraction?: string;
  totalPurchases?: number;
  notes?: string;
}

interface FilterState {
  search: string;
  status: 'all' | 'Active' | 'Inactive';
  sortBy: keyof Customer;
  sortDirection: 'asc' | 'desc';
  page: number;
  itemsPerPage: number;
}

function Customers() {
  const customerStorage = createStorageService<Customer>(StorageKeys.CUSTOMERS);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load customers from storage on component mount
  useEffect(() => {
    const loadCustomers = () => {
      const storedCustomers = customerStorage.getAll();
      if (storedCustomers.length === 0) {
        // Initialize with mock data if storage is empty
        const mockCustomers = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1 234 567 890',
            status: 'Active' as const,
            joinedDate: '2024-01-15',
            lastInteraction: '2024-02-20',
            totalPurchases: 3,
            notes: 'Interested in luxury properties'
          },
          {
            id: '2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+1 234 567 891',
            status: 'Inactive' as const,
            joinedDate: '2024-01-16',
            lastInteraction: '2024-02-19',
            totalPurchases: 1,
            notes: 'Looking for rental properties'
          }
        ];
        mockCustomers.forEach(customer => customerStorage.add(customer));
        setCustomers(mockCustomers);
      } else {
        setCustomers(storedCustomers);
      }
    };

    loadCustomers();
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortDirection: 'asc',
    page: 1,
    itemsPerPage: 10
  });

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone.includes(filters.search);
      const matchesStatus = filters.status === 'all' || customer.status === filters.status;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / filters.itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (filters.page - 1) * filters.itemsPerPage,
    filters.page * filters.itemsPerPage
  );

  const handleSort = (field: keyof Customer) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCustomers(checked ? filteredCustomers.map(c => c.id) : []);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleBulkDelete = () => {
    selectedCustomers.forEach(id => customerStorage.delete(id));
    setCustomers(prev => prev.filter(c => !selectedCustomers.includes(c.id)));
    setSelectedCustomers([]);
    setShowDeleteModal(false);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleStatusFilter = (status: FilterState['status']) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1
    }));
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setShowEditModal(true);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    try {
      customerStorage.update(updatedCustomer.id, updatedCustomer);
      setCustomers(prev => prev.map(c =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      ));
      setShowEditModal(false);
      setCustomerToEdit(null);
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-700 text-3xl font-medium">Customers</h3>
          <p className="text-gray-500 mt-1">
            {filteredCustomers.length} customers found
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCustomers.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete Selected ({selectedCustomers.length})
            </button>
          )}
          <Link
            to="/customers/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Customer
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mt-6 flex gap-4">
        <input
          type="text"
          placeholder="Search customers..."
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
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

      {/* Customers Table */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
        <thead>
  <tr>
    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100">
      <input
        type="checkbox"
        checked={selectedCustomers.length === filteredCustomers.length}
        onChange={(e) => handleSelectAll(e.target.checked)}
        className="rounded border-gray-300"
      />
    </th>
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
      onClick={() => handleSort('name')}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</span>
        {filters.sortBy === 'name' && (
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        )}
      </div>
    </th>
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
      onClick={() => handleSort('email')}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</span>
        {filters.sortBy === 'email' && (
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        )}
      </div>
    </th>
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
      onClick={() => handleSort('phone')}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</span>
        {filters.sortBy === 'phone' && (
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        )}
      </div>
    </th>
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
      onClick={() => handleSort('status')}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
        {filters.sortBy === 'status' && (
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        )}
      </div>
    </th>
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
      onClick={() => handleSort('joinedDate')}
    >
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</span>
        {filters.sortBy === 'joinedDate' && (
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
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
  {paginatedCustomers.map((customer) => (
    <tr key={customer.id} className="hover:bg-gray-50">
      <td className="px-5 py-5 border-b border-gray-200">
        <input
          type="checkbox"
          checked={selectedCustomers.includes(customer.id)}
          onChange={() => handleSelectCustomer(customer.id)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10">
            <img
              className="w-full h-full rounded-full"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}`}
              alt={customer.name}
            />
          </div>
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">{customer.name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <p className="text-gray-900 whitespace-no-wrap">{customer.email}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <p className="text-gray-900 whitespace-no-wrap">{customer.phone}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          customer.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {customer.status}
        </span>
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <p className="text-gray-900 whitespace-no-wrap">
          {new Date(customer.joinedDate).toLocaleDateString()}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditCustomer(customer)}
            className="text-blue-600 hover:text-blue-900"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setSelectedCustomers([customer.id]);
              setShowDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-600">
            Showing {((filters.page - 1) * filters.itemsPerPage) + 1} to{' '}
            {Math.min(filters.page * filters.itemsPerPage, filteredCustomers.length)} of{' '}
            {filteredCustomers.length} entries
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
          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
                className={`px-4 py-2 border rounded-lg ${
                  filters.page === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                }`}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete {selectedCustomers.length} selected customer(s)?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && customerToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Customer</h3>
            {/* Add your edit form here */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateCustomer(customerToEdit)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
