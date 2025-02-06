/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { BasicDetails } from '../components/forms/PropertyFormSteps/BasicDetails';
import { Features } from '../components/forms/PropertyFormSteps/Features';
import { Location } from '../components/forms/PropertyFormSteps/Location';
import { Media } from '../components/forms/PropertyFormSteps/Media';
import { useProperty } from '../context/PropertyContext';
import { Property } from '../types/property';
import { createStorageService, StorageKeys } from '../services/storage';

function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProperty, updateProperty } = useProperty();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const propertyStorage = createStorageService<Property>(StorageKeys.PROPERTIES);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
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
          lat: 51.5074, // Default to London coordinates
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
    if (id) {
      const property = propertyStorage.getById(id);
      if (property) {
        reset(property);
        setValue('media.images', property.media.images);
      } else {
        navigate('/properties');
        alert('Property not found');
      }
    }
  }, []);

  const mediaImages = watch('media.images');
  const isLastStepValid = step === 4 ? mediaImages && mediaImages.length > 0 : true;

  const onSubmit = async (data: Property | Omit<Property, 'id'>) => {
    if (step === 4 && (!mediaImages || mediaImages.length === 0)) {
      alert('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);

      if (id) {
        // Update existing property
        await updateProperty({
          ...data as Property,
          updatedAt: new Date().toISOString()
        });
        alert('Property updated successfully!');
      } else {
        // Create new property
        await addProperty({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        alert('Property created successfully!');
      }

      navigate('/properties');
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Failed to save property. Please try again.');
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
        return !errors.location;
      case 4:
        return mediaImages && mediaImages.length > 0;
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
        return <Media register={register} setValue={setValue} errors={errors} />;
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Basic Details', 'Features & Amenities', 'Location', 'Media'];
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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {id ? 'Edit Property' : 'Add New Property'}
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
                Previous
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep() || isSubmitting}
                  className="px-4 py-2 bg-[#e56e43] text-white rounded-lg
                    hover:bg-[#e56e43]/90 transition-colors duration-200
                    disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isValid || !isLastStepValid || isSubmitting}
                  className="px-4 py-2 bg-[#e56e43] text-white rounded-lg
                    hover:bg-[#e56e43]/90 transition-colors duration-200
                    disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Property'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PropertyForm;
