/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from '../hooks/useAuth';
import { customerApi } from '../services/api';
import { Customer } from '../types/customer';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
}

type CustomerAction =
  | { type: 'FETCH_CUSTOMERS_SUCCESS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_CUSTOMER'; payload: Customer | null };

const CustomerContext = createContext<{
  state: CustomerState;
  dispatch: React.Dispatch<CustomerAction>;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string) => Promise<void>;
} | undefined>(undefined);

const customerReducer = (state: CustomerState, action: CustomerAction): CustomerState => {
  switch (action.type) {
    case 'FETCH_CUSTOMERS_SUCCESS':
      return {
        ...state,
        customers: action.payload,
        loading: false,
      };
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload],
        loading: false
      };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
        loading: false
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload),
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
    case 'SET_SELECTED_CUSTOMER':
      return {
        ...state,
        selectedCustomer: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(customerReducer, {
    customers: [],
    loading: false,
    error: null,
    selectedCustomer: null,
  });

  // Initialize with data from database
  useEffect(() => {
    const initializeCustomers = async () => {
      if (!token) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const customersFromDB = await customerApi.getCustomers(token);
        dispatch({ type: 'FETCH_CUSTOMERS_SUCCESS', payload: customersFromDB });
      } catch (error) {
        console.error("Error fetching customers:", error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize customers from database' });
      }
    };

    initializeCustomers();
  }, [token]);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const customers = await customerApi.getCustomers(token);
      dispatch({ type: 'FETCH_CUSTOMERS_SUCCESS', payload: customers });
    } catch (error) {
      console.error("Error fetching customers:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch customers from database' });
    }
  }, [token]);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCustomer = await customerApi.addCustomer(customer, token);
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    } catch (error) {
      console.error("Error adding customer:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add customer to database' });
    }
  };

  const updateCustomer = async (customer: Customer) => {
    if (!token) return;

    // Validate that we have a valid customer ID before making the API call
    if (!customer || !customer.id) {
      console.error("Cannot update customer: Invalid or missing customer ID");
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update customer: Invalid ID' });
      throw new Error('Invalid customer ID');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if we need to transform the ID for MongoDB
      // MongoDB might store the ID as _id internally, but your frontend uses id
      const customerForApi = {
        ...customer,
        // If the backend expects _id instead of id, uncomment the next line
        // _id: customer.id,
      };

      console.log("Sending update to API:", customerForApi);
      const updatedCustomer = await customerApi.updateCustomer(customer.id, customerForApi, token);
      console.log("API response after update:", updatedCustomer);

      dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
    } catch (error) {
      console.error("Error updating customer:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update customer in database' });
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!token) return;

    // Validate that we have a valid customer ID before making the API call
    if (!id) {
      console.error("Cannot delete customer: Invalid or missing customer ID");
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete customer: Invalid ID' });
      throw new Error('Invalid customer ID');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if the ID is in the correct format for MongoDB
      console.log("Attempting to delete customer with ID:", id);

      await customerApi.deleteCustomer(id, token);
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    } catch (error) {
      console.error("Error deleting customer:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete customer from database' });
      throw error; // Re-throw the error so the component can handle it
    }
  };

  const getCustomer = async (id: string) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const customer = await customerApi.getCustomer(id, token);
      if (customer) {
        dispatch({ type: 'SET_SELECTED_CUSTOMER', payload: customer });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Customer not found in database' });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch customer from database' });
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        state,
        dispatch,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
