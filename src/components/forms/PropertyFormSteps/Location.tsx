import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Property } from '../../../types/property';
import { PropertyMap } from '../../PropertyMap';

interface LocationProps {
  register: UseFormRegister<Property>;
  setValue: UseFormSetValue<Property>;
  errors: FieldErrors<Property>;
}

export function Location({ register, setValue, errors }: LocationProps) {
  const handleLocationSelect = (lat: number, lng: number) => {
    setValue('location.coordinates.lat', lat);
    setValue('location.coordinates.lng', lng);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Property Address</label>
        <input
          type="text"
          {...register('location.address', { required: 'Address is required' })}
          className={`mt-1 block w-full px-4 py-3 rounded-lg border
            ${errors.location?.address ? 'border-red-300' : 'border-gray-200'}
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200 bg-white text-gray-800
            placeholder-gray-400 shadow-sm`}
          placeholder="Enter property address"
        />
        {errors.location?.address && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.location.address.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Map Location</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <PropertyMap
            latitude={51.5074}
            longitude={-0.1278}
            onLocationSelect={handleLocationSelect}
            isEditable={true}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click on the map or use the search box to set the property location
        </p>
      </div>
    </div>
  );
}
