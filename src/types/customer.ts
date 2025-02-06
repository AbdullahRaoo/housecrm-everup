// Create a proper Customer type in a separate types file
// src/types/customer.ts
export interface Customer {
  propertiesViewed: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  lastInteraction?: string;
  totalPurchases?: number;
  notes?: string;
}

