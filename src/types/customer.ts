export interface Customer {
  [x: string]: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: "Active" | "Inactive" | "Lead";
  notes?: string;
  joinedDate: string;
  lastInteraction?: string;
  propertiesViewed: string[]; // Changed from number to string array to match MongoDB schema
  preferences?: {
    budget?: {
      min?: number;
      max?: number;
    };
    location?: string[];
    propertyType?: string[];
    features?: string[];
  };
}
