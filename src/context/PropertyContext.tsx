/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Property } from '../types/property';
import { createStorageService, StorageKeys } from '../services/storage';

interface PropertyState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  selectedProperty: Property | null;
}

type PropertyAction =
  | { type: 'FETCH_PROPERTIES_SUCCESS'; payload: Property[] }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null };

const PropertyContext = createContext<{
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Promise<void>;
} | undefined>(undefined);

const propertyReducer = (state: PropertyState, action: PropertyAction): PropertyState => {
  switch (action.type) {
    case 'FETCH_PROPERTIES_SUCCESS':
      return {
        ...state,
        properties: action.payload,
        loading: false,
      };
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [...state.properties, action.payload],
        loading: false
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
        loading: false
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
        loading: false
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_SELECTED_PROPERTY':
      return {
        ...state,
        selectedProperty: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export function PropertyProvider({ children }: { children: ReactNode }) {
  const propertyStorage = createStorageService<Property>(StorageKeys.PROPERTIES);
  const [state, dispatch] = useReducer(propertyReducer, {
    properties: [],
    loading: false,
    error: null,
    selectedProperty: null,
  });

  // Initialize with data from local storage
  useEffect(() => {
    const initializeProperties = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedProperties = propertyStorage.getAll();
        if (savedProperties.length === 0) {
          // If no properties in storage, use mock data
          const mockProperties: Property[] = [
            {
              id: '1',
              title: 'Luxury Villa with Pool',
              propertyType: 'Villa',
              type: 'Sale',
              price: 750000,
              status: 'Available',
              location: {
                address: '123 Luxury Lane, Beverly Hills, CA 90210',
                coordinates: { lat: 34.0736, lng: -118.4004 },
                area: 'Beverly Hills'
              },
              features: {
                bedrooms: 5,
                bathrooms: 4,
                area: 4500,
                amenities: ['Pool', 'Garden', 'Security', 'Garage']
              },
              media: {
                images: [
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
                  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
                  'https://images.unsplash.com/photo-1600607687644-4e4140d76a6f'
                ],
                videos: [],
              },
              documents: [],
              description: 'Luxurious villa featuring modern amenities and stunning views.',
              statistics: {
                views: 245,
                inquiries: 12,
                visits: 8
              },
              owner: {
                id: 'owner1',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '(555) 123-4567'
              },
              visits: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Modern City Apartment',
              propertyType: 'Apartment',
              type: 'Rent',
              price: 2500,
              status: 'Available',
              location: {
                address: '456 Urban Ave, Los Angeles, CA 90012',
                coordinates: { lat: 34.0522, lng: -118.2437 },
                area: 'Downtown LA'
              },
              features: {
                bedrooms: 2,
                bathrooms: 2,
                area: 1200,
                amenities: ['Air Conditioning', 'Gym', 'Parking', 'Security']
              },
              media: {
                images: [
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c01'
                ],
                videos: []
              },
              documents: [],
              description: 'Modern apartment in the heart of downtown with amazing city views.',
              statistics: {
                views: 180,
                inquiries: 8,
                visits: 4
              },
              owner: {
                id: 'owner2',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '(555) 987-6543'
              },
              visits: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          // Save mock data to storage
          mockProperties.forEach(property => propertyStorage.add(property));
          dispatch({ type: 'FETCH_PROPERTIES_SUCCESS', payload: mockProperties });
        } else {
          dispatch({ type: 'FETCH_PROPERTIES_SUCCESS', payload: savedProperties });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize properties' });
      }
    };

    initializeProperties();
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const properties = propertyStorage.getAll();
      dispatch({ type: 'FETCH_PROPERTIES_SUCCESS', payload: properties });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch properties' });
    }
  }, []);

  const addProperty = async (property: Omit<Property, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProperty = propertyStorage.add(property);
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add property' });
    }
  };

  const updateProperty = async (property: Property) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProperty = propertyStorage.update(property.id, property);
      dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update property' });
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      propertyStorage.delete(id);
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete property' });
    }
  };

  const getProperty = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const property = propertyStorage.getById(id);
      if (property) {
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Property not found' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch property' });
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        state,
        dispatch,
        fetchProperties,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
