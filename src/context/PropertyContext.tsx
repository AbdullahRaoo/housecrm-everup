/* eslint-disable react-refresh/only-export-components */

import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from '../hooks/useAuth';
import { propertyApi } from '../services/api';
import { Property } from '../types/property';

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
  const { token } = useAuth();
  const [state, dispatch] = useReducer(propertyReducer, {
    properties: [],
    loading: false,
    error: null,
    selectedProperty: null,
  });

  // Initialize with data from database
  useEffect(() => {
    const initializeProperties = async () => {
      if (!token) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const propertiesFromDB = await propertyApi.getProperties(token);
        dispatch({ type: 'FETCH_PROPERTIES_SUCCESS', payload: propertiesFromDB });
      } catch (error) {
        console.error("Error fetching properties:", error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize properties from database' });
      }
    };

    initializeProperties();
  }, [token]);

  const fetchProperties = useCallback(async () => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const properties = await propertyApi.getProperties(token);
      dispatch({ type: 'FETCH_PROPERTIES_SUCCESS', payload: properties });
    } catch (error) {
      console.error("Error fetching properties:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch properties from database' });
    }
  }, [token]);

  const addProperty = async (property: Omit<Property, 'id'>) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProperty = await propertyApi.addProperty(property, token);
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
    } catch (error) {
      console.error("Error adding property:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add property to database' });
    }
  };

  const updateProperty = async (property: Property) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProperty = await propertyApi.updateProperty(property.id, property, token);
      dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
    } catch (error) {
      console.error("Error updating property:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update property in database' });
    }
  };

  const deleteProperty = async (id: string) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await propertyApi.deleteProperty(id, token);
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
    } catch (error) {
      console.error("Error deleting property:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete property from database' });
    }
  };

  const getProperty = async (id: string) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const property = await propertyApi.getProperty(id, token);
      if (property) {
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Property not found in database' });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch property from database' });
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
