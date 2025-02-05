/* eslint-disable react-hooks/exhaustive-deps */
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { createStorageService, StorageKeys } from '../services/storage';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyGallery } from '../components/PropertyGallery';
import { DocumentManager } from '../components/DocumentManager';
import { VisitScheduler } from '../components/VisitScheduler';
import { PropertyStatistics } from '../components/PropertyStatistics';

interface Visit {
  id: string;
  date: string;
  clientId: string; // Add this required field
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyStorage = createStorageService<Property>(StorageKeys.PROPERTIES);
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = () => {
      if (!id) {
        setError('Property ID is missing');
        return;
      }

      try {
        setLoading(true);
        const foundProperty = propertyStorage.getById(id);
        if (foundProperty) {
          setProperty(foundProperty);
          propertyStorage.update(id, {
            ...foundProperty,
            statistics: {
              ...foundProperty.statistics,
              views: foundProperty.statistics.views + 1
            }
          });
        } else {
          setError('Property not found');
          navigate('/properties');
        }
      } catch (error) {
        setError('Error fetching property');
        console.error('Error fetching property:', error);
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleScheduleVisit = async (visitData: Omit<Visit, 'id' | 'propertyId' | 'status'>) => {
    if (!property || !id) return;

    try {
      const newVisit = {
        ...visitData,
        id: Math.random().toString(36).substring(2, 9),
        clientId: Math.random().toString(36).substring(2, 9), // Generate clientId
        status: 'Scheduled' as const
      };

      const updatedProperty = {
        ...property,
        visits: [...property.visits, newVisit],
        statistics: {
          ...property.statistics,
          visits: property.statistics.visits + 1
        }
      };

      propertyStorage.update(id, updatedProperty);
      setProperty(updatedProperty);
      setShowVisitModal(false);
    } catch (error) {
      console.error('Failed to schedule visit:', error);
      alert('Failed to schedule visit. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error || 'Property not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">{property.title}</h1>
          <p className="text-gray-600 mt-1">{property.propertyType} for {property.type}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Edit Property
          </button>
          <button
            onClick={() => setShowVisitModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Schedule Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PropertyGallery images={property.media.images} title={property.title} />

          <div className="bg-white rounded-lg shadow-md mt-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 ${activeTab === 'features' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-4 py-2 ${activeTab === 'location' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 ${activeTab === 'documents' ? 'border-b-2 border-blue-500' : ''}`}
              >
                Documents
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'details' && (
                <div>
                  <p className="text-gray-700">{property.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p>{property.location.address}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Price</h3>
                      <p>${property.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Property Features</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Bedrooms</span>
                        <span>{property.features.bedrooms}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Bathrooms</span>
                        <span>{property.features.bathrooms}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Area</span>
                        <span>{property.features.area} sq ft</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.features.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="h-[400px]">
                  <PropertyMap
                    latitude={property.location.coordinates.lat}
                    longitude={property.location.coordinates.lng}
                    isEditable={false}
                  />
                </div>
              )}

              {activeTab === 'documents' && (
                <DocumentManager />
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-4">Property Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-sm ${property.status === 'Available' ? 'bg-green-100 text-green-800' :
                  property.status === 'Sold' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {property.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listed Date</span>
                <span className="font-medium">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-4">Owner Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{property.owner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{property.owner.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{property.owner.phone}</span>
              </div>
            </div>
          </div>

          <PropertyStatistics property={property} />
        </div>
      </div>

      {showVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Schedule a Visit</h3>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <VisitScheduler
                propertyId={property.id}
                onSchedule={handleScheduleVisit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;
