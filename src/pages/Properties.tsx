import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyFilters, PropertySearch } from '../components/PropertySearch';
import { useProperty } from '../context/PropertyContext';
import { Property } from '../types/property';

function Properties() {
  const { state, fetchProperties, deleteProperty } = useProperty();
  const { properties, loading, error } = state;
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  const handleSearch = (filters: PropertyFilters) => {
    const filtered = properties.filter(property => {
      const matchesQuery = property.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        property.location.address.toLowerCase().includes(filters.query.toLowerCase());
      const matchesType = !filters.type || property.type === filters.type;
      const matchesStatus = !filters.status || property.status === filters.status;
      const matchesPriceRange = (!filters.priceRange.min || property.price >= filters.priceRange.min) &&
        (!filters.priceRange.max || property.price <= filters.priceRange.max);
      const matchesFeatures = (!filters.features.bedrooms || property.features.bedrooms >= filters.features.bedrooms) &&
        (!filters.features.bathrooms || property.features.bathrooms >= filters.features.bathrooms);

      return matchesQuery && matchesType && matchesStatus && matchesPriceRange && matchesFeatures;
    });

    setFilteredProperties(filtered);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-800 text-3xl font-semibold">Properties</h3>
          <p className="text-gray-600 mt-1">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            {filteredProperties.length !== properties.length && ` (filtered from ${properties.length})`}
          </p>
        </div>
        <Link
          to="/properties/new"
          className="bg-[#e56e43] hover:bg-[#e56e43]/90 text-white px-6 py-2.5 rounded-lg
            flex items-center gap-2 transition-colors duration-200 font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Property
        </Link>
      </div>

      <div className="mt-6">
        <PropertySearch onSearch={handleSearch} />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden
              hover:shadow-lg transition-all duration-200"
          >
            <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100
                transition-opacity duration-200 z-10 flex">
              <Link
                to={`/properties/edit/${property.id}`}
                className="inline-block p-2 bg-white rounded-full shadow-lg hover:bg-gray-50
                    transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 text-[#e56e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
              <button
                onClick={(e) => handleDelete(property.id, e)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50
                    transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <Link
              to={`/properties/${property.id}`}
              className="block"
            >
              <div className="relative">
                <img
                  src={(property.media && property.media.images && property.media.images.length > 0)
                    ? property.media.images[0]
                    : 'https://via.placeholder.com/400x300'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60">
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-2xl font-bold">${property.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{property.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{property.location.address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${property.status === 'Available'
                    ? 'bg-[#e56e43]/10 text-[#e56e43]'
                    : property.status === 'Sold'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {property.status}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">
                    ${property.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#e56e43] font-medium">{property.type}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-gray-600 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#e56e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{property.features.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#e56e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{property.features.bathrooms} baths</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#e56e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>{property.features.area} sq ft</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="font-medium text-[#e56e43]">{property.statistics.views}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-[#e56e43]">{property.statistics.inquiries}</div>
                    <div className="text-xs text-gray-600">Inquiries</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-[#e56e43]">{property.statistics.visits}</div>
                    <div className="text-xs text-gray-600">Visits</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {properties.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new property.</p>
            <div className="mt-6">
              <Link
                to="/properties/new"
                className="inline-flex items-center px-6 py-2.5 bg-[#e56e43] text-white rounded-lg
                  hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Property
              </Link>
            </div>
          </div>
        )}

        {filteredProperties.length === 0 && properties.length > 0 && !loading && (
          <div className="col-span-3 text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Properties;
