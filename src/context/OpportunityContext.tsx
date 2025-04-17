/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from '../hooks/useAuth';
import { opportunityApi } from '../services/api';
import { Opportunity } from '../types/opportunity';

interface OpportunityState {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  selectedOpportunity: Opportunity | null;
}

type OpportunityAction =
  | { type: 'FETCH_OPPORTUNITIES_SUCCESS'; payload: Opportunity[] }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: Opportunity }
  | { type: 'DELETE_OPPORTUNITY'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_OPPORTUNITY'; payload: Opportunity | null };

const OpportunityContext = createContext<{
  state: OpportunityState;
  dispatch: React.Dispatch<OpportunityAction>;
  fetchOpportunities: () => Promise<void>;
  addOpportunity: (opportunity: Omit<Opportunity, 'id'>) => Promise<void>;
  updateOpportunity: (opportunity: Opportunity) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  getOpportunity: (id: string) => Promise<void>;
  fetchCustomerOpportunities: (customerId: string) => Promise<void>;
} | undefined>(undefined);

const opportunityReducer = (state: OpportunityState, action: OpportunityAction): OpportunityState => {
  switch (action.type) {
    case 'FETCH_OPPORTUNITIES_SUCCESS':
      return {
        ...state,
        opportunities: action.payload,
        loading: false,
      };
    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        opportunities: [...state.opportunities, action.payload],
        loading: false
      };
    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(o =>
          o.id === action.payload.id ? action.payload : o
        ),
        loading: false
      };
    case 'DELETE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.filter(o => o.id !== action.payload),
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
    case 'SET_SELECTED_OPPORTUNITY':
      return {
        ...state,
        selectedOpportunity: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export function OpportunityProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(opportunityReducer, {
    opportunities: [],
    loading: false,
    error: null,
    selectedOpportunity: null,
  });

  // Initialize with data from database
  useEffect(() => {
    const initializeOpportunities = async () => {
      if (!token) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const opportunitiesFromDB = await opportunityApi.getOpportunities(token);
        dispatch({ type: 'FETCH_OPPORTUNITIES_SUCCESS', payload: opportunitiesFromDB });
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize opportunities from database' });
      }
    };

    initializeOpportunities();
  }, [token]);

  const fetchOpportunities = useCallback(async () => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const opportunities = await opportunityApi.getOpportunities(token);
      dispatch({ type: 'FETCH_OPPORTUNITIES_SUCCESS', payload: opportunities });
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch opportunities from database' });
    }
  }, [token]);

  const fetchCustomerOpportunities = useCallback(async (customerId: string) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const opportunities = await opportunityApi.getCustomerOpportunities(customerId, token);
      dispatch({ type: 'FETCH_OPPORTUNITIES_SUCCESS', payload: opportunities });
    } catch (error) {
      console.error("Error fetching customer opportunities:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch customer opportunities from database' });
    }
  }, [token]);

  const addOpportunity = async (opportunity: Omit<Opportunity, 'id'>) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newOpportunity = await opportunityApi.addOpportunity(opportunity, token);
      dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpportunity });
    } catch (error) {
      console.error("Error adding opportunity:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add opportunity to database' });
      throw error;
    }
  };

  const updateOpportunity = async (opportunity: Opportunity) => {
    if (!token) return;

    // Validate that we have a valid opportunity ID before making the API call
    if (!opportunity || !opportunity.id) {
      console.error("Cannot update opportunity: Invalid or missing opportunity ID");
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update opportunity: Invalid ID' });
      throw new Error('Invalid opportunity ID');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedOpportunity = await opportunityApi.updateOpportunity(opportunity.id, opportunity, token);
      dispatch({ type: 'UPDATE_OPPORTUNITY', payload: updatedOpportunity });
    } catch (error) {
      console.error("Error updating opportunity:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update opportunity in database' });
      throw error;
    }
  };

  const deleteOpportunity = async (id: string) => {
    if (!token) return;

    // Validate that we have a valid opportunity ID before making the API call
    if (!id) {
      console.error("Cannot delete opportunity: Invalid or missing opportunity ID");
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete opportunity: Invalid ID' });
      throw new Error('Invalid opportunity ID');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await opportunityApi.deleteOpportunity(id, token);
      dispatch({ type: 'DELETE_OPPORTUNITY', payload: id });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete opportunity from database' });
      throw error;
    }
  };

  const getOpportunity = useCallback(async (id: string) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const opportunity = await opportunityApi.getOpportunity(id, token);
      dispatch({ type: 'SET_SELECTED_OPPORTUNITY', payload: opportunity });
      return opportunity;
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch opportunity from database' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token]);

  return (
    <OpportunityContext.Provider
      value={{
        state,
        dispatch,
        fetchOpportunities,
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        getOpportunity,
        fetchCustomerOpportunities
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
}

export function useOpportunity() {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error('useOpportunity must be used within an OpportunityProvider');
  }
  return context;
}
