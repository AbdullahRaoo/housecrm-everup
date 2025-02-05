import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { BasicDetails } from '../components/forms/PropertyFormSteps/BasicDetails';
import { Features } from '../components/forms/PropertyFormSteps/Features';
import { Media } from '../components/forms/PropertyFormSteps/Media';
import { Location } from '../components/forms/PropertyFormSteps/Location';
import { Property } from '../types/property';

function PropertyForm() {
  const navigate = useNavigate();
  const { addProperty } = useProperty();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  // Watch media images to validate
  const mediaImages = watch('media.images');
  const isLastStepValid = step === 4 ? mediaImages && mediaImages.length > 0 : true;

  const onSubmit = async (data: Omit<Property, 'id'>) => {
    if (step === 4 && (!mediaImages || mediaImages.length === 0)) {
      alert('Please upload at least one image');
      return;
    }

    try {
      setIsSubmitting(true);
      await addProperty({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Show success message
      alert('Property saved successfully!');

      // Redirect to properties list
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
      <div className="flex mb-8">
        {steps.map((stepName, index) => (
          <div
            key={stepName}
            className={`flex-1 text-center ${
              index + 1 === step
                ? 'text-blue-600'
                : index + 1 < step
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  index + 1 === step
                    ? 'bg-blue-100 border-2 border-blue-600'
                    : index + 1 < step
                    ? 'bg-green-100 border-2 border-green-600'
                    : 'bg-gray-100 border-2 border-gray-400'
                }`}
              >
                {index + 1 < step ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="text-sm mt-2">{stepName}</div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    index + 1 < step ? 'bg-green-600' : 'bg-gray-300'
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
        <h1 className="text-2xl font-semibold mb-6">Add New Property</h1>

        {renderStepIndicator()}

        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={step === 1 || isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep() || isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isValid || !isLastStepValid || isSubmitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
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
