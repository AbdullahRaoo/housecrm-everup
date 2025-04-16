import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentManager } from '../components/DocumentManager';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyStatistics } from '../components/PropertyStatistics';
import { VisitScheduler } from '../components/VisitScheduler';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../hooks/useAuth';
import { Property } from '../types/property';

type TabType = 'details' | 'features' | 'location' | 'documents';

interface Visit {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

interface CloudinaryImage {
  url: string;
  public_id: string;
}

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { deleteProperty } = useProperty();

  const fetchProperty = useCallback(async () => {
    if (!id || !token) {
      setError('Property ID or authentication is missing');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Property not found');
      }

      const data = await response.json();

      // Normalize media images to CloudinaryImage format
      if (data.media && data.media.photos) {
        data.media.images = data.media.photos.map((url: string) => ({
          url,
          public_id: url.split('/').pop() || url
        }));
      }

      setProperty(data);
    } catch (error) {
      setError('Error fetching property');
      console.error('Error fetching property:', error);
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleDelete = async () => {
    if (!id || !property) return;

    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        // Use the deleteProperty function from context
        await deleteProperty(id);
        alert('Property deleted successfully!');
        navigate('/properties');
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const handleUpdateImages = useCallback((images: CloudinaryImage[]) => {
    if (!property || !token || !id) return;

    // Update the property with new images
    setProperty(prev => {
      if (!prev) return null;
      return {
        ...prev,
        media: {
          ...prev.media,
          images,
          photos: images.map(img => img.url)
        }
      };
    });

    // You could also save the updated images to the server here
  }, [property, token, id]);

  const handleScheduleVisit = useCallback(async (visitData: Omit<Visit, 'id' | 'propertyId' | 'status'>) => {
    if (!property || !id || !token) return;

    try {
      const newVisit = {
        ...visitData,
        propertyId: id,
        status: 'Scheduled' as const
      };

      const response = await fetch(`http://localhost:5001/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newVisit)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule visit');
      }

      const updatedVisit = await response.json();

      // Update local property state with new visit
      setProperty(prev => {
        if (!prev) return null;
        return {
          ...prev,
          visits: [...prev.visits, updatedVisit],
          statistics: {
            ...prev.statistics,
            visits: prev.statistics.visits + 1
          }
        };
      });

      setShowVisitModal(false);
      alert('Visit scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule visit:', error);
      alert('Failed to schedule visit. Please try again.');
    }
  }, [property, id, token]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e56e43]" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error</p>
          <p className="mt-1">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case 'details':
        return (
          <div>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                <p className="text-gray-600">{property.location.address}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Price</h3>
                <p className="text-[#e56e43] text-xl font-bold">
                  ${property.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Property Features</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="font-medium text-[#e56e43]">{property.features.bedrooms}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="font-medium text-[#e56e43]">{property.features.bathrooms}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Area</span>
                  <span className="font-medium text-[#e56e43]">{property.features.area} sq ft</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {property.features.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <svg
                      className="w-4 h-4 text-[#e56e43] mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="h-[400px]">
            {property.location?.coordinates ? (
              <PropertyMap
                latitude={property.location.coordinates.lat}
                longitude={property.location.coordinates.lng}
                isEditable={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <p className="text-gray-500">Location coordinates not available</p>
              </div>
            )}
          </div>
        );

      case 'documents':
        return <DocumentManager propertyId={property.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">{property.title}</h1>
          <p className="text-gray-600 mt-1">{property.propertyType} for {property.type}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="px-4 py-2 bg-[#e56e43] text-white rounded-lg hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium"
          >
            Edit Property
          </button>
          <button
            onClick={() => setShowVisitModal(true)}
            className="px-4 py-2 border border-[#e56e43] text-[#e56e43] rounded-lg hover:bg-[#e56e43]/10 transition-colors duration-200 font-medium"
          >
            Schedule Visit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Delete Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PropertyGallery
            images={property.media.images || []}
            title={property.title}
            editable={true}
            onImagesChange={handleUpdateImages}
          />

          <div className="bg-white rounded-lg shadow-md mt-6">
            <div className="flex border-b">
              {(['details', 'features', 'location', 'documents'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-3 transition-colors duration-200 ${activeTab === tab
                    ? 'border-b-2 border-[#e56e43] text-[#e56e43] font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.status === 'Available'
                  ? 'bg-[#e56e43]/10 text-[#e56e43]'
                  : property.status === 'Sold'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {property.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-800">{property.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Listed Date</span>
                <span className="font-medium text-gray-800">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Owner Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-800">{property.owner?.name || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-800">{property.owner?.email || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-800">{property.owner?.phone || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <PropertyStatistics property={property} />
        </div>
      </div>

      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Schedule a Visit</h3>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <VisitScheduler propertyId={property.id} onSchedule={handleScheduleVisit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;
