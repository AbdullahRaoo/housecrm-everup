import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
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
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          {...register('location.address', { required: 'Address is required' })}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.location?.address ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.location?.address && (
          <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
        )}
      </div>

      <PropertyMap
        latitude={51.5074}
        longitude={-0.1278}
        onLocationSelect={handleLocationSelect}
        isEditable={true}
      />
    </div>
  );
}
