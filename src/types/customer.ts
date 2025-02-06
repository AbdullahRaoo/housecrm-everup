export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  lastInteraction?: string;
  totalPurchases?: number;
  notes?: string;
  propertiesViewed: number;
}
