export const StorageKeys = {
  CUSTOMERS: 'crm_customers',
  PROPERTIES: 'crm_properties',
  VISITS: 'crm_visits',
  DOCUMENTS: 'crm_documents'
} as const;

export interface StorageService<T> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  add: (item: Omit<T, 'id'>) => T;
  update: (id: string, item: T) => T;
  delete: (id: string) => void;
  clear: () => void;
}

export function createStorageService<T extends { id: string }>(key: string): StorageService<T> {
  const getAll = (): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const getById = (id: string): T | undefined => {
    const items = getAll();
    return items.find(item => item.id === id);
  };

  const add = (item: Omit<T, 'id'>): T => {
    const items = getAll();
    const newItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T;

    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    return newItem;
  };

  const update = (id: string, item: T): T => {
    const items = getAll();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const updatedItem = {
      ...item,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    localStorage.setItem(key, JSON.stringify(items));
    return updatedItem;
  };

  const delete_ = (id: string): void => {
    const items = getAll();
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredItems));
  };

  const clear = (): void => {
    localStorage.removeItem(key);
  };

  return {
    getAll,
    getById,
    add,
    update,
    delete: delete_,
    clear
  };
}
