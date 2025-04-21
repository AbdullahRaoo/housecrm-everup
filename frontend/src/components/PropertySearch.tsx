import { useState } from 'react';

interface PropertySearchProps {
  onSearch: (filters: PropertyFilters) => void;
}

export interface PropertyFilters {
  query: string;
  type: string;
  priceRange: {
    min: number;
    max: number;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
  };
  status: string;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [filters, setFilters] = useState<PropertyFilters>({
    query: '',
    type: '',
    priceRange: { min: 0, max: 0 },
    features: { bedrooms: 0, bathrooms: 0 },
    status: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };


  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
    focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
    transition-colors duration-200 bg-white text-gray-800
    placeholder-gray-400 shadow-sm`;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Search</label>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Search properties..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option value="">All Types</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2.5 bg-[#e56e43] text-white rounded-lg
            hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium shadow-sm"
        >
          Search Properties
        </button>
      </div>
    </form>
  );
}
