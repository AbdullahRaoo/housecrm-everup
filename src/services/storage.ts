import axios from "axios";

export const StorageKeys = {
  CUSTOMERS: "crm_customers",
  PROPERTIES: "crm_properties",
  VISITS: "crm_visits",
  DOCUMENTS: "crm_documents",
  EVENTS: "crm_events",
} as const;

export interface StorageService<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  add: (item: Omit<T, "id">) => Promise<T>;
  update: (id: string, item: T) => Promise<T>;
  delete: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

// Map StorageKeys to actual API endpoints
const apiEndpointMap: Record<string, string> = {
  crm_customers: "customers",
  crm_properties: "properties",
  crm_events: "calendar",
  crm_visits: "visits",
  crm_documents: "documents",
};

export function createStorageService<T extends { id: string }>(
  key: string
): StorageService<T> {
  // Map the storage key to the correct API endpoint
  const endpoint = apiEndpointMap[key] || key;
  const apiUrl = `/api/${endpoint}`;

  console.log(
    `Creating storage service for key ${key}, using API endpoint: ${apiUrl}`
  );

  const getAll = async (): Promise<T[]> => {
    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${apiUrl}:`, error);
      // Return an empty array on error to prevent app crashes
      return [];
    }
  };

  const getById = async (id: string): Promise<T | undefined> => {
    try {
      const response = await axios.get(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${apiUrl}/${id}:`, error);
      return undefined;
    }
  };

  const add = async (item: Omit<T, "id">): Promise<T> => {
    const response = await axios.post(apiUrl, item);
    return response.data;
  };

  const update = async (id: string, item: T): Promise<T> => {
    const response = await axios.put(`${apiUrl}/${id}`, item);
    return response.data;
  };

  const delete_ = async (id: string): Promise<void> => {
    await axios.delete(`${apiUrl}/${id}`);
  };

  const clear = async (): Promise<void> => {
    console.warn(
      "Clear operation is not supported for database-backed storage."
    );
  };

  return {
    getAll,
    getById,
    add,
    update,
    delete: delete_,
    clear,
  };
}
