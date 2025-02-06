import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStorageService, StorageKeys } from '../services/storage';
import { Customer } from '../types/customer';

function CustomerForm() {
  const navigate = useNavigate();
  const customerStorage = createStorageService<Customer>(StorageKeys.CUSTOMERS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    lastInteraction: new Date().toISOString(),
    totalPurchases: 0,
    notes: '',
    propertiesViewed: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newCustomer = customerStorage.add(formData);
      console.log('Customer created:', newCustomer);
      navigate('/customers');
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Failed to create customer. Please try again.');
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
