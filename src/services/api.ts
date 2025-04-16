/* eslint-disable @typescript-eslint/no-explicit-any */
// API service for handling backend requests

// Add explicit type declaration for process.env
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // In production, API is served from same origin
    : "http://localhost:5001/api"; // In development, API is on port 5001

// Calendar API
export const calendarApi = {
  // Get all calendar events
  getEvents: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/calendar`, {
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
    const response = await fetch(`${API_URL}/calendar`, {
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
    const response = await fetch(`${API_URL}/calendar/${id}`, {
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
    const response = await fetch(`${API_URL}/calendar/${id}`, {
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
    const response = await fetch(`${API_URL}/export/calendar/excel`, {
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
    const response = await fetch(`${API_URL}/export/calendar/csv`, {
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
      `${API_URL}/export/calendar/${format}/${filterType}/${filterId}`,
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
    const response = await fetch(`${API_URL}/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    return response.json();
  },

  // Get single customer
  getCustomer: async (id: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.status}`);
    }

    return response.json();
  },

  // Add a new customer
  addCustomer: async (customerData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add customer: ${response.status}`);
    }

    return response.json();
  },

  // Update an existing customer
  updateCustomer: async (
    id: string,
    customerData: any,
    token: string
  ): Promise<any> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer: ${response.status}`);
    }

    return response.json();
  },

  // Delete a customer
  deleteCustomer: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete customer: ${response.status}`);
    }
  },
};

// Property API
export const propertyApi = {
  // Get all properties
  getProperties: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/properties`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.status}`);
    }

    return response.json();
  },

  // Get a single property
  getProperty: async (id: string, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch property: ${response.status}`);
    }

    return response.json();
  },

  // Add a new property
  addProperty: async (propertyData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add property: ${response.status}`);
    }

    return response.json();
  },

  // Update an existing property
  updateProperty: async (
    id: string,
    propertyData: any,
    token: string
  ): Promise<any> => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update property: ${response.status}`);
    }

    return response.json();
  },

  // Delete a property
  deleteProperty: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete property: ${response.status}`);
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
    const response = await fetch(`${API_URL}/auth/login`, {
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
    const response = await fetch(`${API_URL}/auth/register`, {
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
    const response = await fetch(`${API_URL}/auth/profile`, {
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
    const response = await fetch(`${API_URL}/auth/profile`, {
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

    const response = await fetch(`${API_URL}/uploads/image`, {
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

    const response = await fetch(`${API_URL}/uploads/images`, {
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
      `${API_URL}/uploads/image/${encodeURIComponent(publicId)}`,
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
