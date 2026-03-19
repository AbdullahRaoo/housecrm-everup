import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Property } from '../../../types/property';

interface FeaturesProps {
  register: UseFormRegister<Property>;
  errors: FieldErrors<Property>;
}

export function Features({ register, errors }: FeaturesProps) {
  const amenities = [
    'Estacionamiento',
    'Piscina',
    'Jardín',
    'Seguridad',
    'Gimnasio',
    'Aire acondicionado',
    'Ascensor',
    'Balcón',
    'Trastero',
    'Amueblado',
    'Se aceptan mascotas',
    'Internet',
    'Televisión por cable',
    'Lavadora',
    'Lavavajillas'
  ];

  const propertyTypes = [
    'Apartamento',
    'Casa',
    'Villa',
    'Oficina',
    'Comercial',
    'Terreno',
    'Industrial'
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Tipo de propiedad</label>
        <select
          {...register('propertyType', { required: 'El tipo de propiedad es obligatorio' })}
          className={`mt-1 block w-full px-4 py-3 rounded-lg border
            ${errors.propertyType ? 'border-red-300' : 'border-gray-200'}
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200 bg-white text-gray-800
            shadow-sm appearance-none cursor-pointer`}
        >
          <option value="">Seleccione el tipo de propiedad</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.propertyType && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            {errors.propertyType.message?.toString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Habitaciones</label>
          <input
            type="number"
            {...register('features.bedrooms', {
              required: 'Las habitaciones son obligatorias',
              min: { value: 0, message: 'Las habitaciones deben ser 0 o más' }
            })}
            className={`mt-1 block w-full px-4 py-3 rounded-lg border
              ${errors.features?.bedrooms ? 'border-red-300' : 'border-gray-200'}
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              placeholder-gray-400 shadow-sm`}
            placeholder="Número de habitaciones"
          />
          {errors.features?.bedrooms && (
            <p className="mt-2 text-sm text-red-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {errors.features.bedrooms.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Baños</label>
          <input
            type="number"
            {...register('features.bathrooms', {
              required: 'Los baños son obligatorios',
              min: { value: 0, message: 'Los baños deben ser 0 o más' }
            })}
            className={`mt-1 block w-full px-4 py-3 rounded-lg border
              ${errors.features?.bathrooms ? 'border-red-300' : 'border-gray-200'}
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              placeholder-gray-400 shadow-sm`}
            placeholder="Número de baños"
          />
          {errors.features?.bathrooms && (
            <p className="mt-2 text-sm text-red-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {errors.features.bathrooms.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Área (m²)</label>
          <input
            type="number"
            {...register('features.area', {
              required: 'El área es obligatoria',
              min: { value: 1, message: 'El área debe ser mayor que 0' }
            })}
            className={`mt-1 block w-full px-4 py-3 rounded-lg border
              ${errors.features?.area ? 'border-red-300' : 'border-gray-200'}
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              placeholder-gray-400 shadow-sm`}
            placeholder="Área de la propiedad en m²"
          />
          {errors.features?.area && (
            <p className="mt-2 text-sm text-red-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {errors.features.area.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-4">Comodidades</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                {...register('features.amenities')}
                value={amenity}
                className="w-4 h-4 rounded border-gray-300 text-[#e56e43]
                  focus:ring-[#e56e43] focus:ring-offset-0"
              />
              <label className="ml-2 text-sm text-gray-700 select-none">{amenity}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
