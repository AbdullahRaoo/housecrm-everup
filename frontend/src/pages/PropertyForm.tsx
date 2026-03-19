import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { BasicDetails } from '../components/forms/PropertyFormSteps/BasicDetails';
import { Features } from '../components/forms/PropertyFormSteps/Features';
import { Location } from '../components/forms/PropertyFormSteps/Location';
import { Media } from '../components/forms/PropertyFormSteps/Media';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../hooks/useAuth';
import { Property } from '../types/property';

function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProperty, updateProperty, fetchProperties } = useProperty();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const [initialized, setInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<Property>({
    mode: 'onChange',
    defaultValues: {
      status: 'Available',
      propertyType: 'Apartment',
      type: 'Sale',
      features: {
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        amenities: []
      },
      location: {
        address: '',
        coordinates: {
          lat: 51.5074,
          lng: -0.1278
        },
        area: ''
      },
      media: {
        images: [],
        videos: []
      },
      documents: [],
      visits: [],
      statistics: {
        views: 0,
        inquiries: 0,
        visits: 0
      },
      owner: {
        id: '',
        name: '',
        email: '',
        phone: ''
      }
    }
  });

  useEffect(() => {
    const loadProperty = async () => {
      if (!id || !token || initialized) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Propiedad no encontrada');
        }

        const property = await response.json();

        // Make sure images are properly formatted
        if (property.media && property.media.photos) {
          // Convert to the format expected by the Media component
          property.media.images = property.media.photos.map((url: string) => ({
            url,
            public_id: url.split('/').pop() || url
          }));
        }

        reset(property);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading property:', error);
        navigate('/properties');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, token, navigate, reset, initialized]);

  const mediaImages = watch('media.images');

  const onSubmit = async (data: Property | Omit<Property, 'id'>) => {
    if (step !== 4) {
      handleNext();
      return;
    }

    if (!mediaImages || mediaImages.length === 0) {
      alert('Por favor suba al menos una imagen');
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the property data for the API
      const propertyData = {
        ...data,
        media: {
          ...data.media,
          // Format correctly for the server - it expects photos not images
          photos: Array.isArray(mediaImages)
            ? mediaImages.map(img => typeof img === 'string' ? img : img.url)
            : []
        },
        updatedAt: new Date().toISOString()
      };

      if (id) {
        await updateProperty({ ...propertyData, id } as Property);
        alert('¡Propiedad actualizada exitosamente!');
      } else {
        await addProperty({
          ...propertyData,
          createdAt: new Date().toISOString()
        });
        alert('¡Propiedad creada exitosamente!');
      }

      // Refresh properties list to include the new/updated property
      await fetchProperties();
      navigate('/properties');
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('No se pudo guardar la propiedad. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return !errors.title && !errors.price && !errors.description;
      case 2:
        return !errors.features && !errors.propertyType;
      case 3:
        // Don't block navigation if Google Maps API key is missing
        return !errors.location?.address;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4 && validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicDetails register={register} errors={errors} />;
      case 2:
        return <Features register={register} errors={errors} />;
      case 3:
        return <Location register={register} setValue={setValue} errors={errors} />;
      case 4:
        return (
          <Media
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Detalles básicos', 'Características y amenidades', 'Ubicación', 'Medios'];
    return (
      <div className="flex mb-8 relative">
        {steps.map((stepName, index) => (
          <div
            key={stepName}
            className={`flex-1 text-center ${index + 1 === step
              ? 'text-[#e56e43]'
              : index + 1 < step
                ? 'text-[#e56e43]/80'
                : 'text-gray-400'
              }`}
          >
            <div className="relative">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center
                  transition-all duration-300 transform relative z-50
                  ${index + 1 === step
                    ? 'bg-[#e56e43] text-white shadow-lg scale-110'
                    : index + 1 < step
                      ? 'bg-[#e56e43] border-2 border-[#e56e43]'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
              >
                {index + 1 < step ? (
                  <svg
                    className={`w-5 h-5 ${index + 1 < step ? 'text-white' : 'text-[#e56e43]'
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className={`text-base font-semibold ${index + 1 === step ? 'text-white' : 'text-gray-400'
                    }`}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="text-sm mt-3 font-medium">{stepName}</div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-[2px] transition-all duration-300
                    ${index + 1 < step
                      ? 'bg-[#e56e43]'
                      : 'bg-gray-200'
                    }`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-t-[#e56e43] border-r-[#e56e43]/30 border-b-[#e56e43]/30 border-l-[#e56e43]/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {id ? 'Editar propiedad' : 'Agregar nueva propiedad'}
        </h1>

        {renderStepIndicator()}

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={step === 1 || isSubmitting}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg
                  hover:bg-gray-50 transition-colors duration-200
                  disabled:opacity-50 disabled:hover:bg-white"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={!validateStep() || isSubmitting}
                className="px-4 py-2 bg-[#e56e43] text-white rounded-lg
                  hover:bg-[#e56e43]/90 transition-colors duration-200
                  disabled:opacity-50"
              >
                {step === 4
                  ? isSubmitting ? 'Guardando...' : 'Guardar propiedad'
                  : 'Siguiente'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PropertyForm;
