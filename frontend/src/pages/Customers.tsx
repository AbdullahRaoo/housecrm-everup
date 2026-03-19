/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useAuth } from '../hooks/useAuth';
import { CalendarEvent } from '../types/calendar';
import { Customer } from '../types/customer';

interface FilterState {
  search: string;
  status: 'all' | 'Active' | 'Inactive';
  sortBy: keyof Customer;
  sortDirection: 'asc' | 'desc';
  page: number;
  itemsPerPage: number;
}

function Customers() {
  const { token } = useAuth();
  const { state: { customers, loading, error }, fetchCustomers, updateCustomer, deleteCustomer } = useCustomer();
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
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerTasks, setCustomerTasks] = useState<Record<string, CalendarEvent[]>>({});
  const [customerProperties, setCustomerProperties] = useState<Record<string, any[]>>({});
  const [availableProperties, setAvailableProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token, fetchCustomers]);

  useEffect(() => {
    if (expandedCustomerId && token) {
      fetchCustomerTasks(expandedCustomerId);
      fetchCustomerProperties(expandedCustomerId);
    }
  }, [expandedCustomerId, token]);

  useEffect(() => {
    if (token) {
      fetchAvailableProperties();
    }
  }, [token]);

  const fetchCustomerTasks = async (customerId: string) => {
    try {
      const response = await fetch('/api/calendar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const allTasks = await response.json();
      const customerSpecificTasks = allTasks.filter(
        (task: CalendarEvent) => task.customerId === customerId
      );

      setCustomerTasks(prev => ({
        ...prev,
        [customerId]: customerSpecificTasks
      }));
    } catch (error) {
      console.error('Error fetching customer tasks:', error);
    }
  };

  const fetchCustomerProperties = async (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId || c._id === customerId);
      if (!customer) return;

      const propertyIds = customer.propertiesViewed || [];

      if (propertyIds.length === 0) {
        setCustomerProperties(prev => ({
          ...prev,
          [customerId]: []
        }));
        return;
      }

      const response = await fetch('/api/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const allProperties = await response.json();
      const customerProperties = allProperties.filter(
        (property: any) => propertyIds.includes(property.id || property._id)
      );

      setCustomerProperties(prev => ({
        ...prev,
        [customerId]: customerProperties
      }));
    } catch (error) {
      console.error('Error fetching customer properties:', error);
    }
  };

  const fetchAvailableProperties = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const properties = await response.json();
      setAvailableProperties(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  // Function to add a property interest to a customer
  const addPropertyInterest = async (custId: string, propertyId: string) => {
    if (!custId || !propertyId || !token) {
      alert('Missing customer or property information');
      return;
    }

    try {
      // Find the customer in the current state
      const customer = customers.find(c => c.id === custId || c._id === custId);
      if (!customer) {
        alert('Customer not found');
        return;
      }

      console.log('Found customer:', customer);

      // Prepare updated propertiesViewed array
      const updatedPropertiesViewed = [
        ...(customer.propertiesViewed || []),
        propertyId
      ];

      // Remove duplicates
      const uniquePropertiesViewed = [...new Set(updatedPropertiesViewed)];

      // Ensure we're using the correct ID field
      const customerIdToUse = customer.id || customer._id;
      if (!customerIdToUse) {
        alert('Invalid customer ID');
        return;
      }

      // Update customer with new property interest
      const updatedCustomer = {
        ...customer,
        id: customerIdToUse, // Ensure we always have an id field
        propertiesViewed: uniquePropertiesViewed
      };

      console.log('Updating customer with:', updatedCustomer);

      await updateCustomer(updatedCustomer as Customer);

      // Refresh the customer properties list
      await fetchCustomerProperties(custId);

      // Reset property selection
      setSelectedProperty('');

      // Show success feedback
      alert('Property interest added successfully');
    } catch (error) {
      console.error('Error adding property interest:', error);
      alert(`Failed to add property interest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleCustomerExpand = (customerId: string) => {
    setExpandedCustomerId(prev => prev === customerId ? null : customerId);
  };

  const filteredCustomers = (customers || [])
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (customer.phone?.includes(filters.search) || false);
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
    setSelectedCustomers(checked ? filteredCustomers.map(c => c._id || c.id) : []);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: FilterState['status']) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const customerData = {
        ...updatedCustomer,
        id: updatedCustomer._id || updatedCustomer.id,
        phone: updatedCustomer.phone || '',
        address: updatedCustomer.address || '',
        notes: updatedCustomer.notes || '',
        propertiesViewed: updatedCustomer.propertiesViewed || [],
        preferences: updatedCustomer.preferences || {
          budget: { min: 0, max: 0 },
          location: [],
          propertyType: [],
          features: []
        }
      };

      await updateCustomer(customerData as Customer);
      setShowEditModal(false);
      setCustomerToEdit(null);
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert(error instanceof Error ? error.message : 'Failed to update customer');
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (!selectedCustomers.length) return;

      const deletePromises = selectedCustomers.map(async (id) => {
        try {
          if (!id) return { success: false, id: 'undefined', error: 'Invalid ID' };
          await deleteCustomer(id);
          return { success: true, id };
        } catch (error) {
          return { success: false, id, error };
        }
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`${successCount} deleted successfully. ${failCount} failed.`);
      } else {
        alert(`${successCount} customer(s) deleted successfully.`);
      }

      setShowDeleteModal(false);
      setSelectedCustomers([]);
      await fetchCustomers();
    } catch (error) {
      alert('Failed to delete customers');
    }
  };

  const renderCustomerDetails = (customerId: string) => {
    const tasks = customerTasks[customerId] || [];
    const properties = customerProperties[customerId] || [];

    return (
      <tr key={`details-${customerId}`}>
        <td colSpan={7} className="px-5 py-5 bg-gray-50 border-b border-gray-200">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Tareas asignadas ({tasks.length})</h4>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 italic">No hay tareas asignadas a este cliente</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, idx) => (
                      <div key={task.id || `task-${idx}-${customerId}`} className="border-b pb-2">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-700">{task.title}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {task.type} · {new Date(task.start).toLocaleDateString()}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Intereses de propiedad ({properties.length})</h4>
                {properties.length === 0 ? (
                  <p className="text-gray-500 italic">No hay intereses de propiedad registrados</p>
                ) : (
                  <div className="space-y-3">
                    {properties.map((property, propIdx) => (
                      <div key={`${property.id || property._id}-${propIdx}`} className="flex items-center border-b pb-2">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={property.media?.photos?.[0] || 'https://via.placeholder.com/150'}
                            alt={property.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="font-medium text-gray-700">{property.title}</p>
                          <p className="text-sm text-gray-500">
                            {property.location?.address}
                          </p>
                          <p className="text-sm font-semibold text-[#e56e43]">
                            ${property.price?.toLocaleString()}
                          </p>
                        </div>
                        <Link
                          to={`/properties/${property.id || property._id}`}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Ver
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agregar interés de propiedad</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43]"
                    >
                      <option value="">Seleccionar una propiedad</option>
                      {availableProperties
                        .filter(property => {
                          // Filter out properties that are already in the customer's interests
                          const propertyId = property.id || property._id;
                          const customerPropertyIds = properties.map(p => p.id || p._id);
                          return !customerPropertyIds.includes(propertyId);
                        })
                        .map((property, idx) => (
                          <option key={`option-${property.id || property._id}-${idx}`} value={property.id || property._id}>
                            {property.title}
                          </option>
                        ))
                      }
                    </select>
                    <button
                      onClick={() => addPropertyInterest(customerId, selectedProperty)}
                      disabled={!selectedProperty}
                      className="px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200 disabled:opacity-50"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg text-gray-700">Acciones rápidas</h4>
                  <div className="space-x-2">
                    <Link
                      to={`/calendar?customerId=${customerId}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Programar tarea
                    </Link>
                    <button
                      onClick={() => handleEditCustomer(customers.find(c => c.id === customerId || c._id === customerId)!)}
                      className="inline-flex items-center px-4 py-2 border border-[#e56e43] shadow-sm text-sm font-medium rounded-md text-[#e56e43] bg-white hover:bg-[#e56e43]/10 focus:outline-none"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e56e43]"></div>
      </div>
    );
  }

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
        <h3 className="text-3xl font-semibold text-gray-800">Clientes</h3>
        <Link
          to="/customers/new"
          className="inline-flex items-center px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir cliente
        </Link>
      </div>
      <div className="mt-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        />
        <select
          value={filters.status}
          onChange={(e) => handleStatusFilter(e.target.value as FilterState['status'])}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        >
          <option value="all">Todos los estados</option>
          <option value="Active">Activo</option>
          <option value="Inactive">Inactivo</option>
        </select>
        <select
          value={filters.itemsPerPage}
          onChange={(e) => setFilters(prev => ({ ...prev, itemsPerPage: Number(e.target.value), page: 1 }))}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
        >
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>
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
              <th onClick={() => handleSort('name')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</span>
                  {filters.sortBy === 'name' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('email')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Correo electrónico</span>
                  {filters.sortBy === 'email' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('phone')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</span>
                  {filters.sortBy === 'phone' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('status')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</span>
                  {filters.sortBy === 'status' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('joinedDate')} className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de registro</span>
                  {filters.sortBy === 'joinedDate' && (
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-5 text-center text-gray-500">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer, index) => (
                <React.Fragment key={`customer-${customer._id || customer.id}-${index}`}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${expandedCustomerId === (customer._id || customer.id) ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleCustomerExpand(customer._id || customer.id)}
                  >
                    <td className="px-5 py-5 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer._id || customer.id)}
                        onChange={() => handleSelectCustomer(customer._id || customer.id)}
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
                          <p className="text-gray-900 whitespace-no-wrap font-medium">{customer.name}</p>
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
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomer(customer);
                          }}
                          className="text-[#e56e43] hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomers([customer._id || customer.id]);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCustomerExpand(customer._id || customer.id);
                          }}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <span className="mr-1">Detalles</span>
                          <svg
                            className={`w-4 h-4 transform transition-transform ${expandedCustomerId === (customer._id || customer.id) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedCustomerId === (customer._id || customer.id) && renderCustomerDetails(customer._id || customer.id)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-600">
            Mostrando {((filters.page - 1) * filters.itemsPerPage) + 1} a{' '}
            {Math.min(filters.page * filters.itemsPerPage, filteredCustomers.length)} de{' '}
            {filteredCustomers.length} entradas
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
                className={`px-4 py-2 border rounded-lg ${filters.page === page ? 'bg-[#e56e43] text-white' : 'hover:bg-gray-50'
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
            Siguiente
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar {selectedCustomers.length} cliente(s) seleccionado(s)?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && customerToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Editar cliente</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={customerToEdit.name}
                  onChange={(e) => setCustomerToEdit({
                    ...customerToEdit,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={customerToEdit.email}
                  onChange={(e) => setCustomerToEdit({
                    ...customerToEdit,
                    email: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={customerToEdit.phone}
                  onChange={(e) => setCustomerToEdit({
                    ...customerToEdit,
                    phone: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={customerToEdit.status}
                  onChange={(e) => setCustomerToEdit({
                    ...customerToEdit,
                    status: e.target.value as 'Active' | 'Inactive'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43]"
                >
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={customerToEdit.notes}
                  onChange={(e) => setCustomerToEdit({
                    ...customerToEdit,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e56e43]/20 focus:border-[#e56e43] resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateCustomer(customerToEdit)}
                className="px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
