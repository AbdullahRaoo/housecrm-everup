/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// API service for handling backend requests

import axios from "axios";

// Get the API URL from environment variables
//const API_URL = import.meta.env.VITE_API_URL || "/api";
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "") || "/api";
const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost";
const API_PORT = import.meta.env.VITE_API_PORT || "5000";

// Create the full API base URL
const API_BASE_URL = `${API_HOST}:${API_PORT}`;
const FULL_API_URL = `${API_HOST}:${API_PORT}${API_URL}`;

// Axios instance with the correct base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Calendar API
export const calendarApi = {
  // Get all calendar events
  getEvents: async (token: string): Promise<any[]> => {
    const response = await fetch(`${FULL_API_URL}/calendar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return response.json();
  },

  // Add a new calendar event
  addEvent: async (eventData: any, token: string): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/calendar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add event: ${response.status}`);
    }

    return response.json();
  },

  // Update an existing calendar event
  updateEvent: async (
    id: string,
    eventData: any,
    token: string
  ): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/calendar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.status}`);
    }

    return response.json();
  },

  // Delete a calendar event
  deleteEvent: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${FULL_API_URL}/calendar/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
  },

  // Export full calendar as Excel
  exportExcel: async (token: string): Promise<Blob> => {
    const response = await fetch(`${FULL_API_URL}/export/calendar/excel`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed with status: ${response.status}`);
    }

    return response.blob();
  },

  // Export full calendar as CSV
  exportCsv: async (token: string): Promise<Blob> => {
    const response = await fetch(`${FULL_API_URL}/export/calendar/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed with status: ${response.status}`);
    }

    return response.blob();
  },

  // Export filtered calendar data (by client or property)
  exportFiltered: async (
    format: "excel" | "csv",
    filterType: "client" | "property",
    filterId: string,
    token: string
  ): Promise<Blob> => {
    const response = await fetch(
      `${FULL_API_URL}/export/calendar/${format}/${filterType}/${filterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Filtered export failed with status: ${response.status}`);
    }

    return response.blob();
  },
};

// Customer API
export const customerApi = {
  // Get all customers
  getCustomers: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${FULL_API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in getCustomers:", error);
      throw error;
    }
  },

  // Get single customer
  getCustomer: async (id: string, token: string): Promise<any> => {
    try {
      if (!id) {
        throw new Error("Customer ID is required");
      }

      const response = await fetch(`${FULL_API_URL}/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch customer: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in getCustomer:", error);
      throw error;
    }
  },

  // Add a new customer
  addCustomer: async (customerData: any, token: string): Promise<any> => {
    try {
      console.log(
        "Adding customer with data:",
        JSON.stringify(customerData, null, 2)
      );

      const response = await fetch(`${FULL_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to add customer: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in addCustomer:", error);
      throw error;
    }
  },

  // Update an existing customer
  updateCustomer: async (
    id: string,
    customerData: any,
    token: string
  ): Promise<any> => {
    try {
      if (!id) {
        throw new Error("Customer ID is required for updating");
      }

      console.log(
        `Updating customer ${id} with data:`,
        JSON.stringify(customerData, null, 2)
      );

      const response = await fetch(`${FULL_API_URL}/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update customer: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in updateCustomer:", error);
      throw error;
    }
  },

  // Delete a customer
  deleteCustomer: async (id: string, token: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Customer ID is required for deletion");
      }

      console.log(`Deleting customer with id: ${id}`);

      const response = await fetch(`${FULL_API_URL}/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to delete customer: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in deleteCustomer:", error);
      throw error;
    }
  },
};

// Property API
export const propertyApi = {
  // Get all properties
  getProperties: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${FULL_API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Properties fetch error response:", errorText);
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }

      const properties = await response.json();

      // Ensure each property has an id (use _id as fallback)
      return properties.map((property: any) => ({
        ...property,
        id: property.id || property._id,
      }));
    } catch (error) {
      console.error("Error in getProperties:", error);
      throw error;
    }
  },

  // Get a single property
  getProperty: async (id: string, token: string): Promise<any> => {
    try {
      if (!id) {
        throw new Error("Property ID is required");
      }

      console.log(`Fetching property with ID: ${id}`);

      const response = await fetch(`${FULL_API_URL}/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Property fetch error response:", errorText);
        throw new Error(`Failed to fetch property: ${response.status}`);
      }

      const property = await response.json();

      // Ensure property has an id (use _id as fallback)
      return {
        ...property,
        id: property.id || property._id,
      };
    } catch (error) {
      console.error("Error in getProperty:", error);
      throw error;
    }
  },

  // Add a new property
  addProperty: async (propertyData: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${FULL_API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Property add error response:", errorText);
        throw new Error(`Failed to add property: ${response.status}`);
      }

      const property = await response.json();

      // Ensure property has an id (use _id as fallback)
      return {
        ...property,
        id: property.id || property._id,
      };
    } catch (error) {
      console.error("Error in addProperty:", error);
      throw error;
    }
  },

  // Update an existing property
  updateProperty: async (
    id: string,
    propertyData: any,
    token: string
  ): Promise<any> => {
    try {
      if (!id) {
        throw new Error("Property ID is required for updating");
      }

      console.log(`Updating property with ID: ${id}`);

      // Clean up any _id fields that might cause problems with MongoDB
      const cleanData = { ...propertyData };
      if (cleanData._id) {
        delete cleanData._id;
      }

      const response = await fetch(`${FULL_API_URL}/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Property update error response:", errorText);
        throw new Error(`Failed to update property: ${response.status}`);
      }

      const property = await response.json();

      // Ensure property has an id (use _id as fallback)
      return {
        ...property,
        id: property.id || property._id,
      };
    } catch (error) {
      console.error("Error in updateProperty:", error);
      throw error;
    }
  },

  // Delete a property
  deleteProperty: async (id: string, token: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Property ID is required for deletion");
      }

      console.log(`Deleting property with ID: ${id}`);

      const response = await fetch(`${FULL_API_URL}/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Property deletion error response:", errorText);
        throw new Error(`Failed to delete property: ${response.status}`);
      }

      console.log(`Successfully deleted property with ID: ${id}`);
    } catch (error) {
      console.error("Error in deleteProperty:", error);
      throw error;
    }
  },
};

// User/Auth API
export const authApi = {
  // Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
  },

  // Register
  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    return response.json();
  },

  // Get current user profile
  getProfile: async (token: string): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    return response.json();
  },

  // Update user profile
  updateProfile: async (userData: any, token: string): Promise<any> => {
    const response = await fetch(`${FULL_API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    return response.json();
  },
};

// Media Upload API
export const mediaApi = {
  // Upload a single image to Cloudinary
  uploadImage: async (imageFile: File, token: string): Promise<any> => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${FULL_API_URL}/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    return response.json();
  },

  // Upload multiple images to Cloudinary
  uploadImages: async (imageFiles: File[], token: string): Promise<any[]> => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${FULL_API_URL}/uploads/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload images: ${response.status}`);
    }

    return response.json();
  },

  // Delete an image from Cloudinary
  deleteImage: async (publicId: string, token: string): Promise<any> => {
    const response = await fetch(
      `${FULL_API_URL}/uploads/image/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }

    return response.json();
  },
};

// Opportunity API
export const opportunityApi = {
  // Get all opportunities
  getOpportunities: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${FULL_API_URL}/opportunities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in getOpportunities:", error);
      throw error;
    }
  },

  // Get opportunities by customer ID
  getCustomerOpportunities: async (
    customerId: string,
    token: string
  ): Promise<any[]> => {
    try {
      const response = await fetch(
        `${FULL_API_URL}/opportunities/customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch customer opportunities: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error in getCustomerOpportunities:", error);
      throw error;
    }
  },

  // Get single opportunity
  getOpportunity: async (id: string, token: string): Promise<any> => {
    try {
      // Validate the ID before sending to server
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid opportunity ID format");
      }

      const response = await fetch(`${FULL_API_URL}/opportunities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error: ${response.status}`;

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use the raw text
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error("Error in getOpportunity:", error);
      throw error;
    }
  },

  // Create new opportunity
  addOpportunity: async (opportunity: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${FULL_API_URL}/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(opportunity),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create opportunity: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error in addOpportunity:", error);
      throw error;
    }
  },

  // Update opportunity
  updateOpportunity: async (
    id: string,
    opportunity: any,
    token: string
  ): Promise<any> => {
    try {
      // Validate ID format before sending to server
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid opportunity ID format");
      }

      // Make a clean copy of the opportunity object for the API
      const cleanOpportunity = { ...opportunity };

      // Remove redundant ID fields that could cause issues with MongoDB
      if (cleanOpportunity._id) delete cleanOpportunity._id;

      const response = await fetch(`${FULL_API_URL}/opportunities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanOpportunity),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to update opportunity: ${response.status}`;

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use the raw text
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error("Error in updateOpportunity:", error);
      throw error;
    }
  },

  // Delete opportunity
  deleteOpportunity: async (id: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${FULL_API_URL}/opportunities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete opportunity: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in deleteOpportunity:", error);
      throw error;
    }
  },

  // Add income scenario to opportunity
  addScenario: async (
    opportunityId: string,
    scenario: any,
    token: string
  ): Promise<any> => {
    try {
      const response = await fetch(
        `${FULL_API_URL}/opportunities/${opportunityId}/scenarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scenario),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add scenario: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error in addScenario:", error);
      throw error;
    }
  },

  // Delete income scenario
  deleteScenario: async (
    opportunityId: string,
    scenarioId: string,
    token: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${FULL_API_URL}/opportunities/${opportunityId}/scenarios/${scenarioId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete scenario: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in deleteScenario:", error);
      throw error;
    }
  },
};
