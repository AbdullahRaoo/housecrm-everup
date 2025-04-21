import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useAuth } from '../hooks/useAuth';
import { Customer } from '../types/customer';

function CustomerForm() {
  const navigate = useNavigate();
  const { addCustomer } = useCustomer();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    notes: '',
    joinedDate: new Date().toISOString().split('T')[0],
    propertiesViewed: [],
    preferences: {
      budget: { min: 0, max: 0 },
      location: [],
      propertyType: [],
      features: []
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('You must be logged in to add customers');
      }

      // Make sure all required fields are filled
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Add customer through the context which uses API
      await addCustomer(formData);
      console.log('Customer created successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Failed to create customer:', error);
      setError(error instanceof Error ? error.message : 'Failed to create customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
    focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
    transition-colors duration-200 bg-white text-gray-800
    placeholder-gray-400 shadow-sm`;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Customer</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'Lead' }))}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className={`${inputClasses} resize-none`}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50
                  transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e56e43] text-white rounded-lg
                  hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium
                  disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;
