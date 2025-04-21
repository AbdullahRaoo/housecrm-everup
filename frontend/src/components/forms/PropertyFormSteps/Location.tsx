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
          <p className="mt-2 text-sm text-red-500">{errors.location.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Map Location</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <PropertyMap
            latitude={51.5074} // Default to London coordinates
            longitude={-0.1278}
            onLocationSelect={handleLocationSelect}
            isEditable={true}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Click on the map or search for a location to set the property coordinates
        </p>
      </div>
    </div>
  );
}
