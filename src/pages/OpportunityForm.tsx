import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useOpportunity } from '../context/OpportunityContext';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../hooks/useAuth';
import { Customer } from '../types/customer';
import { IncomeScenario, Opportunity } from '../types/opportunity';
import { Property } from '../types/property';

function OpportunityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const { addOpportunity, updateOpportunity, getOpportunity, state: { selectedOpportunity } } = useOpportunity();
  const { state: { customers }, fetchCustomers } = useCustomer();
  const { state: { properties }, fetchProperties } = useProperty();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<Opportunity>({
    title: '',
    description: '',
    customerId: '',
    budget: {
      amount: 0,
      currency: 'USD',
    },
    status: 'Draft',
    incomeScenarios: [],
    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  });

  const [scenario, setScenario] = useState<IncomeScenario>({
    name: '',
    description: '',
    income: 0,
    expenses: 0,
    probability: 50,
    notes: ''
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (token) {
      fetchCustomers();
      fetchProperties();
    }
  }, [token, fetchCustomers, fetchProperties]);

  useEffect(() => {
    const loadOpportunity = async () => {
      if (id && token) {
        try {
          await getOpportunity(id);
        } catch (error) {
          console.error('Failed to load opportunity:', error);
          setError('Failed to load opportunity. Please try again.');
        }
      }
    };

    loadOpportunity();
  }, [id, token, getOpportunity]);

  useEffect(() => {
    if (selectedOpportunity && isEditing) {
      // Format date for HTML date input
      const formattedValidUntil = selectedOpportunity.validUntil
        ? new Date(selectedOpportunity.validUntil).toISOString().split('T')[0]
        : '';

      setFormData({
        ...selectedOpportunity,
        validUntil: formattedValidUntil,
      });
    }
  }, [selectedOpportunity, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'budget.amount') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          amount: Number(value)
        }
      }));
    } else if (name === 'budget.currency') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          currency: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScenario(prev => {
      const updated = {
        ...prev,
        [name]: name === 'income' || name === 'expenses' || name === 'probability'
          ? Number(value)
          : value
      };

      // Auto-calculate ROI
      if ((name === 'income' || name === 'expenses') && updated.income > 0) {
        const netIncome = updated.income - updated.expenses;
        updated.roi = (netIncome / updated.income) * 100;
      }

      return updated;
    });
  };

  const addScenario = () => {
    // Validate scenario
    if (!scenario.name) {
      setError('Scenario name is required');
      return;
    }

    if (scenario.income <= 0) {
      setError('Income must be greater than 0');
      return;
    }

    // Add to form data
    setFormData(prev => ({
      ...prev,
      incomeScenarios: [...prev.incomeScenarios, scenario]
    }));

    // Reset scenario form
    setScenario({
      name: '',
      description: '',
      income: 0,
      expenses: 0,
      probability: 50,
      notes: ''
    });

    setCurrentScenarioIndex(null);
    setError(null);
  };

  const editScenario = (index: number) => {
    setCurrentScenarioIndex(index);
    setScenario(formData.incomeScenarios[index]);
  };

  const updateScenario = () => {
    if (currentScenarioIndex === null) return;

    // Validate
    if (!scenario.name) {
      setError('Scenario name is required');
      return;
    }

    if (scenario.income <= 0) {
      setError('Income must be greater than 0');
      return;
    }

    // Update scenario
    setFormData(prev => {
      const updatedScenarios = [...prev.incomeScenarios];
      updatedScenarios[currentScenarioIndex] = scenario;
      return {
        ...prev,
        incomeScenarios: updatedScenarios
      };
    });

    // Reset
    setScenario({
      name: '',
      description: '',
      income: 0,
      expenses: 0,
      probability: 50,
      notes: ''
    });

    setCurrentScenarioIndex(null);
    setError(null);
  };

  const removeScenario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      incomeScenarios: prev.incomeScenarios.filter((_, i) => i !== index)
    }));

    if (currentScenarioIndex === index) {
      setCurrentScenarioIndex(null);
      setScenario({
        name: '',
        description: '',
        income: 0,
        expenses: 0,
        probability: 50,
        notes: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('You must be logged in to add opportunities');
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.customerId) {
        throw new Error('Customer is required');
      }

      if (formData.budget.amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }

      if (isEditing) {
        await updateOpportunity(formData);
        console.log('Opportunity updated successfully');
      } else {
        await addOpportunity(formData);
        console.log('Opportunity created successfully');
      }

      navigate('/opportunities');
    } catch (error) {
      console.error('Failed to save opportunity:', error);
      setError(error instanceof Error ? error.message : 'Failed to save opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.budget.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
    focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
    transition-colors duration-200 bg-white text-gray-800
    placeholder-gray-400 shadow-sm`;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-700 text-3xl font-medium">
          {isEditing ? 'Edit Opportunity' : 'Create New Opportunity'}
        </h3>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Opportunity title"
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Customer *</label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className={inputClasses}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer: Customer) => (
                  <option key={customer._id || customer.id} value={customer._id || customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Property (Optional)</label>
              <select
                name="propertyId"
                value={formData.propertyId || ''}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">Select Property</option>
                {properties.map((property: Property) => (
                  <option key={property._id || property.id} value={property._id || property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="Draft">Draft</option>
                <option value="Proposed">Proposed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Budget Amount *</label>
              <input
                type="number"
                name="budget.amount"
                value={formData.budget.amount}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Currency</label>
              <select
                name="budget.currency"
                value={formData.budget.currency}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Valid Until</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil?.toString() || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={4}
              className={inputClasses}
              placeholder="Describe the opportunity..."
            ></textarea>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Income Scenarios</h4>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Scenario Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={scenario.name}
                    onChange={handleScenarioChange}
                    placeholder="e.g., Conservative estimate"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    name="probability"
                    value={scenario.probability}
                    onChange={handleScenarioChange}
                    min="0"
                    max="100"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Income Amount *</label>
                  <input
                    type="number"
                    name="income"
                    value={scenario.income}
                    onChange={handleScenarioChange}
                    min="0"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expenses</label>
                  <input
                    type="number"
                    name="expenses"
                    value={scenario.expenses}
                    onChange={handleScenarioChange}
                    min="0"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={scenario.description || ''}
                  onChange={handleScenarioChange}
                  rows={2}
                  className={inputClasses}
                  placeholder="Describe this scenario..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={scenario.notes || ''}
                  onChange={handleScenarioChange}
                  rows={2}
                  className={inputClasses}
                  placeholder="Additional notes..."
                ></textarea>
              </div>

              <div className="mt-2 flex justify-end">
                {currentScenarioIndex !== null ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScenarioIndex(null);
                        setScenario({
                          name: '',
                          description: '',
                          income: 0,
                          expenses: 0,
                          probability: 50,
                          notes: ''
                        });
                      }}
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={updateScenario}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Update Scenario
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={addScenario}
                    className="px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90"
                  >
                    Add Scenario
                  </button>
                )}
              </div>
            </div>

            {formData.incomeScenarios.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Income</th>
                      <th className="px-4 py-2 text-left">Expenses</th>
                      <th className="px-4 py-2 text-left">ROI</th>
                      <th className="px-4 py-2 text-left">Probability</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.incomeScenarios.map((s, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{formatCurrency(s.income)}</td>
                        <td className="px-4 py-2">{formatCurrency(s.expenses)}</td>
                        <td className="px-4 py-2">
                          {s.roi !== undefined ? `${s.roi.toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="px-4 py-2">{s.probability}%</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => editScenario(index)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeScenario(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200 disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditing ? 'Update Opportunity' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OpportunityForm;
