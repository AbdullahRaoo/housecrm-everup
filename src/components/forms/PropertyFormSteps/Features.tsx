import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Property } from '../../../types/property';

interface FeaturesProps {
  register: UseFormRegister<Property>;
  errors: FieldErrors<Property>;
}

export function Features({ register, errors }: FeaturesProps) {
  const amenities = [
    'Parking',
    'Pool',
    'Garden',
    'Security',
    'Gym',
    'Air Conditioning',
    'Elevator',
    'Balcony',
    'Storage',
    'Furnished',
    'Pet Friendly',
    'Internet',
    'Cable TV',
    'Washing Machine',
    'Dishwasher'
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Office',
    'Commercial',
    'Land',
    'Industrial'
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <select
          {...register('propertyType', { required: 'Property type is required' })}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.propertyType ? 'border-red-300' : 'border-gray-300'
            }`}
        >
          <option value="">Select property type</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.propertyType && (
          <p className="mt-1 text-sm text-red-600">{errors.propertyType.message?.toString()}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <input
            type="number"
            {...register('features.bedrooms', {
              required: 'Bedrooms is required',
              min: { value: 0, message: 'Bedrooms must be 0 or more' }
            })}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.features?.bedrooms ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          {errors.features?.bedrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.features.bedrooms.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
          <input
            type="number"
            {...register('features.bathrooms', {
              required: 'Bathrooms is required',
              min: { value: 0, message: 'Bathrooms must be 0 or more' }
            })}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.features?.bathrooms ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          {errors.features?.bathrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.features.bathrooms.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area (sq ft)</label>
          <input
            type="number"
            {...register('features.area', {
              required: 'Area is required',
              min: { value: 1, message: 'Area must be greater than 0' }
            })}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.features?.area ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          {errors.features?.area && (
            <p className="mt-1 text-sm text-red-600">{errors.features.area.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="grid grid-cols-3 gap-4">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                {...register('features.amenities')}
                value={amenity}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">{amenity}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
