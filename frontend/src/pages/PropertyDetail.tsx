/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentManager } from '../components/DocumentManager';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyStatistics } from '../components/PropertyStatistics';
import { VisitScheduler } from '../components/VisitScheduler';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../hooks/useAuth';
import { propertyApi } from '../services/api'; // Import the propertyApi service
import { CloudinaryImage, Property } from '../types/property';

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

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
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
      console.error('Missing property ID or auth token:', { id, hasToken: !!token });
      setError('Property ID or authentication is missing');
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching property with ID: ${id}`);
      // Use the propertyApi service instead of direct fetch
      const data = await propertyApi.getProperty(id, token);

      // Add client-side id if needed
      if (data._id && !data.id) {
        data.id = data._id;
      }

      // Normalize media images to CloudinaryImage format and ensure it matches Property type
      if (data.media) {
        // Ensure images array exists
        if (!data.media.images) {
          data.media.images = [];
        }

        // Convert photos to CloudinaryImage objects if not already
        if (data.media.photos && data.media.photos.length > 0) {
          // Only convert if images array is empty
          if (data.media.images.length === 0) {
            data.media.images = data.media.photos.map((url: string) => ({
              url,
              public_id: url.split('/').pop() || url
            }));
          }
        }

        // Ensure videos array exists
        if (!data.media.videos) {
          data.media.videos = [];
        }
      }

      // TypeScript cast to tell TypeScript this object conforms to Property type
      setProperty(data as Property);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      setError(`Error fetching property: ${error.message}`);
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleDelete = async () => {
    if (!id || !property) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      try {
        console.log(`Deleting property with ID: ${id}`);
        // Use the deleteProperty function from context
        await deleteProperty(id);
        alert('¡Propiedad eliminada exitosamente!');
        navigate('/properties');
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Error al eliminar la propiedad. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleUpdateImages = useCallback((images: CloudinaryImage[]) => {
    if (!property || !token || !id) return;

    // Update the property with new images
    setProperty(prev => {
      if (!prev) return null;

      // Create a new property object with updated media
      const updatedProperty: Property = {
        ...prev,
        media: {
          ...prev.media,
          images: images as any, // Type assertion to avoid TypeScript errors
          photos: images.map(img => img.url)
        }
      };

      return updatedProperty;
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

      // Use API_URL constant from api.ts instead of environment variable directly
      const API_URL = import.meta.env.VITE_API_URL || "/api";

      const response = await fetch(`${API_URL}/visits`, {
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
      alert('Visita agendada exitosamente!');
    } catch (error) {
      console.error('Failed to schedule visit:', error);
      alert('Error al agendar visita. Por favor, inténtalo de nuevo.');
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
          <p className="mt-1">{error || 'Propiedad no encontrada'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a Propiedades
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
                <h3 className="font-semibold text-gray-800 mb-2">Ubicación</h3>
                <p className="text-gray-600">{property.location.address}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Precio</h3>
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
              <h3 className="font-semibold text-gray-800 mb-4">Características de la propiedad</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Habitaciones</span>
                  <span className="font-medium text-[#e56e43]">{property.features.bedrooms}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Baños</span>
                  <span className="font-medium text-[#e56e43]">{property.features.bathrooms}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Área</span>
                  <span className="font-medium text-[#e56e43]">{property.features.area} m²</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Amenidades</h3>
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
                <p className="text-gray-500">Coordenadas de ubicación no disponibles</p>
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
            Editar propiedad
          </button>
          <button
            onClick={() => setShowVisitModal(true)}
            className="px-4 py-2 border border-[#e56e43] text-[#e56e43] rounded-lg hover:bg-[#e56e43]/10 transition-colors duration-200 font-medium"
          >
            Agendar visita
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Eliminar propiedad
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
                  {tab === 'details' && 'Detalles'}
                  {tab === 'features' && 'Características'}
                  {tab === 'location' && 'Ubicación'}
                  {tab === 'documents' && 'Documentos'}
                </button>
              ))}
            </div>
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Detalles de la propiedad</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.status === 'Available'
                  ? 'bg-[#e56e43]/10 text-[#e56e43]'
                  : property.status === 'Sold'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {property.status === 'Available' ? 'Disponible' : property.status === 'Sold' ? 'Vendido' : 'Reservado'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipo</span>
                <span className="font-medium text-gray-800">{property.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fecha de publicación</span>
                <span className="font-medium text-gray-800">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Información del propietario</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nombre</span>
                <span className="font-medium text-gray-800">{property.owner?.name || 'No especificado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Correo electrónico</span>
                <span className="font-medium text-gray-800">{property.owner?.email || 'No especificado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Teléfono</span>
                <span className="font-medium text-gray-800">{property.owner?.phone || 'No especificado'}</span>
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
                <h3 className="text-lg font-semibold text-gray-800">Agendar una visita</h3>
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
