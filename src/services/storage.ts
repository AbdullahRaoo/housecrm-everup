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

export function createStorageService<T extends { id: string }>(
  key: string
): StorageService<T> {
  const apiUrl = `/api/${key}`;

  const getAll = async (): Promise<T[]> => {
    const response = await axios.get(apiUrl);
    return response.data;
  };

  const getById = async (id: string): Promise<T | undefined> => {
    const response = await axios.get(`${apiUrl}/${id}`);
    return response.data;
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
